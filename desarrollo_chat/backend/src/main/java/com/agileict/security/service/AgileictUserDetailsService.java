package com.agileict.security.service;

import com.agileict.modules.auth.repository.UserAccountRepository;
import com.agileict.security.model.AgileictUserDetails;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AgileictUserDetailsService implements UserDetailsService {

    private final UserAccountRepository userAccountRepository;

    public AgileictUserDetailsService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userAccountRepository.findByEmail(username)
                .map(AgileictUserDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado."));
    }
}
