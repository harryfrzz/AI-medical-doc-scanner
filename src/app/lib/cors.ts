import Cors from "cors";

// Initialize CORS middleware
const cors = Cors({
  origin: "*", // Allow all origins (change this to specific domains in production)
  methods: ["GET", "POST", "OPTIONS"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // Allow credentials (cookies, authentication headers, etc.)
});

// Helper function to execute middleware in API routes
export function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default cors;
