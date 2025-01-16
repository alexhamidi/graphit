package com.graphit.configs;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.WriteConcern;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;


@Configuration
@EnableMongoRepositories
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${spring.data.mongodb.uri}")
    private String connectionString;

    @Value("${spring.data.mongodb.database}")
    private String databaseName;

    @Value("${spring.data.mongodb.appname}")
    private String appName;

    protected String getDatabaseName() {
        return databaseName;
    }

    @Override
    @Bean
    public MongoClient mongoClient() {

        String baseUri = connectionString.split("\\?")[0];
        ConnectionString connString = new ConnectionString(baseUri);

        MongoClientSettings settings = MongoClientSettings.builder()
            .applyConnectionString(connString)
            .retryWrites(false)
            .applicationName(appName)
            .writeConcern(WriteConcern.MAJORITY)
            .applyToSocketSettings(builder ->
                builder.connectTimeout(1000, TimeUnit.MILLISECONDS)
                    .readTimeout(1000, TimeUnit.MILLISECONDS)
            )
            .applyToClusterSettings(builder ->
                builder.serverSelectionTimeout(1000, TimeUnit.MILLISECONDS)
            )
            .applyToConnectionPoolSettings(builder ->
                builder.maxWaitTime(1000, TimeUnit.MILLISECONDS))
            .build();

        return MongoClients.create(settings);
    }
}
