interface User {
  name: string;
  email: string;
  id: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}
interface SignInParams {
  email: string;
  idToken: string;
}

type FormType = "sign-up" | "sign-in";