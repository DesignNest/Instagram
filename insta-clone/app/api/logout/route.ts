import { NextRequest, NextResponse } from "next/server";


export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("credentials");

    if (!token) {
      return NextResponse.json(
        { message: "No token to delete", success: false },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      message: "Token deleted successfully",
      success: true,
    });

    response.cookies.set("credentials", "", {
      path: "/",
      expires: new Date(0), 
    });

    return response;
  } catch (error: any) {
    console.error("Cookie Deletion Error:", error.message);
    return NextResponse.json(
      { message: "Failed to delete token", success: false },
      { status: 500 }
    );
  }
}
