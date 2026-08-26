package com.feirs.backend;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.util.Properties;
import java.io.FileInputStream;

public class UpdateDb {
    public static void main(String[] args) {
        try {
            Properties env = new Properties();
            try (FileInputStream fis = new FileInputStream(".env")) {
                env.load(fis);
            }
            String password = env.getProperty("DB_PASSWORD").replace("\"", "");
            
            String url = "jdbc:postgresql://db.tnxaefuxgxtuadxxvjhw.supabase.co:6543/postgres?user=postgres&password=" + password;
            
            try (Connection conn = DriverManager.getConnection(url)) {
                String sql = "UPDATE super_admins SET master_email = 'aditya.admin.feirs@gmail.com' WHERE super_admin_id = 'FEIRS-SA-GLOBAL'";
                try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    int rows = pstmt.executeUpdate();
                    System.out.println("Rows updated: " + rows);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
