import { Outlet } from 'react-router-dom';
export function AuthPage() {
  return (
    <div className="flex">
      <Outlet />
      <div>
        <img
          className="w-1/2 h-screen object-cover absolute top-1/2 right-0 -translate-y-1/2 rounded-4xl p-4"
          src="https://cdn11.bigcommerce.com/s-x49po/images/stencil/1500x1500/products/125322/292509/prints%2Fdownscaled%2Fp_ookwnwrf95_2000x2000__29132.1704707271.jpg?c=2"
          alt="login-page"
        />
      </div>
    </div>
  );
}
