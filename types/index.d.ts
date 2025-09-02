interface User {
  name: string;
  email: string;
  id: string;
  role: "creator" | "customer";
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
  role: "creator" | "customer";
}
interface SignInParams {
  email: string;
  idToken: string;
}

type FormType = "sign-up" | "sign-in";