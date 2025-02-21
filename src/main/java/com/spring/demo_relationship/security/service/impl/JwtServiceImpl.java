package com.spring.demo_relationship.security.service.impl;

import com.spring.demo_relationship.security.config.MyUserDetails;
import com.spring.demo_relationship.security.service.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtServiceImpl implements JwtService {
    @Override
    public String generateJwtToken(String username) {
        Map<String, Object> claims = new HashMap<String, Object>();
        String Token = Jwts
                .builder()
                .claims()
                .add(claims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 60 * 60 * 1000 ))
                .and()
                .signWith(getKey())
                .compact();
        return "Bearer " + Token;
    }

    private SecretKey getKey() {
        String key = "ThisIsASecretKeyForHMACSHA256123";

        String base64Key = Base64.getEncoder().encodeToString(key.getBytes());

        byte[] encodedKey = Base64.getDecoder().decode(base64Key);


        return new SecretKeySpec(encodedKey, "HmacSHA256");
    }
    public String extractUserName(String token) {
        // extract the username from jwt token
        return extractClaim(token, Claims::getSubject);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token, MyUserDetails userDetails) {
        final String userName = extractUserName(token);
        return (userName.equals(userDetails.getEmail()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}
