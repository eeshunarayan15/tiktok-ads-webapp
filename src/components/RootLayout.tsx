import { Outlet } from "react-router";

const RootLayout = () => {
  return (
    <div>
      {/* This renders child routes */}
      <Outlet />
    </div>
  );
};

export default RootLayout;
