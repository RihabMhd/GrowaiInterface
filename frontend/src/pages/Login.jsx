export default function Login() {

  const googleLogin = () => {
    window.location.href =
      "http://localhost:8000/api/auth/google/redirect";
  };

  const facebookLogin = () => {
    window.location.href =
      "http://localhost:8000/api/auth/facebook/redirect";
  };

  return (
    <div>
      <h1>Login</h1>

      <button onClick={googleLogin}>Google</button>
      <button onClick={facebookLogin}>Facebook</button>
    </div>
  );
}