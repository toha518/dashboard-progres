import withAuth from "next-auth/middleware";

export const config = {
  matcher: ["/admin/dashboard/:path*"],
};

export default withAuth;
