import { loginAction } from "./actions";

export default function AdminLoginPage() {
  return (
    <div className="section" style={{ maxWidth: 560, margin: "0 auto" }}>
      <section className="hero"><div className="eyebrow">Admin</div><h1>Operator access</h1><p className="lede">This area is for editorial and operational management only.</p></section>
      <form className="card stack-form" action={loginAction}>
        <label>Email<input type="email" name="email" required /></label>
        <label>Password<input type="password" name="password" required /></label>
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}
