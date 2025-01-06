package com.graphit.services;

import com.graphit.models.Graph;
import com.graphit.models.User;
import com.graphit.repositories.UserRepository;
import java.util.HashMap;
import org.springframework.stereotype.Service;

@Service
public class UserService {


    private UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public HashMap<String, Graph> getUserGraphs(String email) {
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User not found"); // Handle the case where the user is null
        }
        return user.getGraphs();
    }

    public void updateUserGraphs(HashMap<String, Graph> graphs, String email) {
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User not found"); // Handle the case where the user is null
        }
        user.setGraphs(graphs);
        userRepository.save(user);
    }
}
