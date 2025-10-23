package com.tfg.danielsantos.backend.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Component
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private FirebaseAuth firebaseAuth;

    /**
     * Este método decide si el filtro debe ejecutarse o no para una petición específica.
     * Si retorna true, el filtro NO se ejecuta (la petición pasa directamente).
     * Si retorna false, el filtro SÍ se ejecuta (valida el token).
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        logger.info("Checking path: " + path);
        
        // Lista de rutas exactas que deben excluirse
        List<String> exactExcludedPaths = Arrays.asList(
            "/api/v1/health",
            "/api/v1/info",
            "/test-auth.html",
            "/",
            "/index.html",
            "/health"
        );
        
        // Lista de prefijos que deben excluirse
        List<String> prefixExcludedPaths = Arrays.asList(
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/static",
            "/css",
            "/js",
            "/images",
            "/actuator"
        );
        
        // Verificar rutas exactas
        if (exactExcludedPaths.contains(path)) {
            logger.info("Excluding exact path: " + path);
            return true;
        }
        
        // Verificar prefijos
        boolean shouldExclude = prefixExcludedPaths.stream().anyMatch(path::startsWith);
        
        if (shouldExclude) {
            logger.info("Excluding prefix path: " + path);
        } else {
            logger.info("Processing path: " + path);
        }
        
        return shouldExclude;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                FilterChain filterChain) throws ServletException, IOException {
        
        logger.info("FirebaseAuthenticationFilter EXECUTING for: " + request.getRequestURI());
        
        String authorizationHeader = request.getHeader("Authorization");
        logger.info("Authorization header: " + (authorizationHeader != null ? "Present" : "Missing"));
        
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            
            try {
                FirebaseToken decodedToken = firebaseAuth.verifyIdToken(token);
                String uid = decodedToken.getUid();
                
                // Crear autenticación con los datos del usuario
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        uid, 
                        null, 
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                    );
                
                // Agregar información adicional del token
                authentication.setDetails(decodedToken);
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
            } catch (FirebaseAuthException e) {
                logger.error("Error validating Firebase token: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }
        
        filterChain.doFilter(request, response);
        }
}