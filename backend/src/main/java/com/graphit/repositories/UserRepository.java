package com.graphit.repositories;

import com.graphit.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface UserRepository extends MongoRepository<User, String> {

    @Query("{'id': ?0}")
    User findUserById(String id);

    @Query("{'email': ?0}")
    User findUserByEmail(String email);
}
