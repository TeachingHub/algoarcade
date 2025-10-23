package com.tfg.danielsantos.backend.config;

import com.tfg.danielsantos.backend.security.FirebaseAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private FirebaseAuthenticationFilter firebaseAuthenticationFilter;


    /**
     * Configuración principal de seguridad
     * 
     * Define qué rutas son públicas y cuáles requieren autenticación.
     * También configura CORS y el filtro de Firebase.
     * 
     * Rutas públicas:
     * - /api/v1/health - Health check del servidor
     * - /api/v1/info - Información de la API
     * - /auth/** - Todas las rutas de autenticación (register, login, delete)
     * 
     * Funcionamiento:
     * 1. CORS: Permite peticiones desde cualquier origen
     * 2. CSRF: Deshabilitado (no lo necesitamos con JWT/tokens)
     * 3. Sessions: STATELESS (no usamos sesiones, solo tokens)
     * 4. Authorization: Define rutas públicas vs protegidas
     * 5. Filter: Agrega FirebaseAuthenticationFilter a la cadena
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Configurar CORS (permitir peticiones desde frontend)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Deshabilitar CSRF (no lo necesitamos con tokens JWT)
            .csrf(csrf -> csrf.disable())
            
            // Sin sesiones (stateless) - cada petición debe tener su token
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Configurar qué rutas requieren autenticación
            .authorizeHttpRequests(authz -> authz
            // Rutas públicas
            .requestMatchers("/api/v1/health").permitAll()     
            .requestMatchers("/api/v1/info").permitAll()
            .requestMatchers("/api/v1/auth/register").permitAll()
            .requestMatchers("/api/v1/auth/login").permitAll()
            .requestMatchers("/api/v1/auth/delete").authenticated()

            // Cualquier otra ruta requiere autenticación
            .anyRequest().authenticated()
        )
            
            // Agregar el filtro de Firebase ANTES del filtro de autenticación estándar
            // Esto permite que Firebase valide el token antes que Spring Security
            .addFilterBefore(firebaseAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Lista de sitios permitidos para hacer peticiones CORS
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:8080", // Desarrollo backend
            "http://localhost:3000"  // Desarrollo frontend
            ));
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Encabezados permitidos
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin",
            "User-Agent"
        ));

        configuration.setMaxAge(3600L);

        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}