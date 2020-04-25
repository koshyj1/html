using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Reflection;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

using FluentMigrator.Runner;
using Newtonsoft.Json;
using Swashbuckle.AspNetCore.Swagger;

using VetGuardian.Core.Models;
using VetGuardian.DataAccess.Migrations;
using VetGuardian.DependencyResolution;
using VetGuardian.Hubs;
using VetGuardian.Services;
using Microsoft.AspNetCore.Http;

namespace VetGuardian.Web
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/dist";
            });

            services.AddTransient<Func<IDbConnection>>(t => () => new SqliteConnection(Configuration.GetConnectionString("VetGuardian")));
            services.AddVetGuardian();

            services.AddSignalR();
            services.AddLogging(c =>
            {
                c.AddConsole();
                c.AddDebug();
            });

            services.AddFluentMigratorCore()
                .ConfigureRunner(rb => rb
                    .AddSQLite()
                    .WithGlobalConnectionString(Configuration.GetConnectionString("VetGuardian"))
                    .ScanIn(typeof(AddedUnits).Assembly).For.Migrations())
                .AddLogging(lb => lb.AddFluentMigratorConsole());

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new Info { Title = "VetGuardian API", Version = "v1" });

                c.DocumentFilter<LowercaseDocumentFilter>();
                // c.OperationFilter<SecurityRequirementsOperationFilter>();

                c.AddSecurityDefinition("Bearer", new ApiKeyScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                    Name = "Authorization",
                    In = "header",
                    Type = "apiKey"
                });

                var apiXmlPath = Path.Combine(AppContext.BaseDirectory, $"{Assembly.GetExecutingAssembly().GetName().Name}.xml");
                var libraryXmlPath = Path.Combine(AppContext.BaseDirectory, $"VetGuardian.xml");

                c.IncludeXmlComments(apiXmlPath);
                c.IncludeXmlComments(libraryXmlPath);
            });

            services.AddMvc()
                .AddJsonOptions(options =>
                {
                    options.SerializerSettings.DateTimeZoneHandling = DateTimeZoneHandling.Utc;
                    options.SerializerSettings.DateFormatString = "yyyy'-'MM'-'dd'T'HH':'mm':'ss.fffffffK";
                })
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            services.Configure<ApiBehaviorOptions>(options =>
            {
                options.SuppressModelStateInvalidFilter = true;
            });

            services.AddResponseCaching();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseDeveloperExceptionPage();
                //app.UseExceptionHandler("/Error");
                //app.UseHsts();
            }

            // app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseStaticFiles(new StaticFileOptions
            {
                ServeUnknownFileTypes = true,
                DefaultContentType = "text/plain"
            });
            app.UseSpaStaticFiles();

            app.UseCors(builder => builder
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
            );

            app.UseResponseCaching();
            app.Use(async (context, next) =>
            {
                context.Response.GetTypedHeaders().CacheControl = 
                    new Microsoft.Net.Http.Headers.CacheControlHeaderValue()
                    {
                        NoCache = true,
                        NoStore = true
                    };
                await next();
            });

            app.UseSignalR(routes =>
            {
                routes.MapHub<MonitorHub>("/monitorHub");
            });

            // Enable middleware to serve generated Swagger as a JSON endpoint.
            app.UseSwagger();

            // Enable middleware to serve swagger-ui (HTML, JS, CSS, etc.), 
            // specifying the Swagger JSON endpoint.
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
            });

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action=Index}/{id?}");
            });

            if (env.IsDevelopment())
            {
                app.UseSpa(spa =>
                {
                    // To learn more about options for serving an Angular SPA from ASP.NET Core,
                    // see https://go.microsoft.com/fwlink/?linkid=864501

                    spa.Options.SourcePath = "ClientApp";

                    if (env.IsDevelopment())
                    {
                        spa.UseAngularCliServer(npmScript: "start");
                    }
                });
            }

            InitializeDatabase(app);
        }

        private void InitializeDatabase(IApplicationBuilder app)
        {
            using (var scope = app.ApplicationServices.CreateScope())
            {
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<Startup>>();
                logger.LogInformation("Migrating database to latest version...");

                var runner = scope.ServiceProvider.GetRequiredService<IMigrationRunner>();
                runner.MigrateUp();

                logger.LogInformation("Migration complete");
            }
        }
    }
}
