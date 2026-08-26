import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class TestPooler {
    public static void main(String[] args) {
        String[] regions = {
            "us-east-1", "us-west-1", "us-east-2", "us-west-2",
            "ap-south-1", "ap-southeast-1", "ap-northeast-1", "ap-northeast-2",
            "eu-central-1", "eu-west-1", "eu-west-2", "eu-south-1",
            "sa-east-1", "ca-central-1", "ap-southeast-2"
        };
        
        String user = "postgres.tnxaefuxgxtuadxxvjhw";
        String password = "dummy"; // We just want to see if it says password failed vs tenant not found
        
        for (String region : regions) {
            String url = "jdbc:postgresql://aws-0-" + region + ".pooler.supabase.com:6543/postgres";
            try {
                System.out.println("Trying " + region + "...");
                DriverManager.getConnection(url, user, password);
                System.out.println("SUCCESS: " + region); // Won't happen with dummy password
                break;
            } catch (SQLException e) {
                String msg = e.getMessage();
                if (msg.contains("password authentication failed")) {
                    System.out.println("FOUND CORRECT REGION: " + region + " (Auth failed but tenant exists!)");
                    break;
                } else if (msg.contains("tenant/user")) {
                    System.out.println(region + " -> Tenant not found");
                } else {
                    System.out.println(region + " -> " + msg);
                }
            }
        }
    }
}
