import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

// GET route to return the current user's decoded token
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("credentials");

    if (!token) {
      return NextResponse.json(
        { message: "No token found", success: false },
        { status: 401 }
      );
    }

    const decodedToken = jwtDecode(token.value);

    return NextResponse.json({
      message: 'Token verified successfully',
      success: true,
      token: decodedToken, // contains full user info
    });
    
  } catch (error: any) {
    console.error("Token Decode Error:", error.message);
    return NextResponse.json(
      { message: "Invalid token format", success: false },
      { status: 400 }
    );
  }
}
