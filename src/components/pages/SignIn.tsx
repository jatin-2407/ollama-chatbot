import { loginRequestValidationSchema } from "@/validations/schemas";
import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";

interface ISignInData {
    email: string,
    password: string,
}

const validateSignIn = (data: ISignInData): { error: boolean; data: Record<string, string> | ISignInData } => {

    const res = loginRequestValidationSchema.safeParse(data);

    if (!res.success) {
        const errors = res.error.issues.reduce(
            (acc, issue) => ({
                ...acc,
                [issue.path.join(".")]: issue.message
            }),
            {} as Record<string, string>
        );

        return {
            error: true,
            data: errors
        };
    }

    return {
        error: false,
        data: res.data
    };
};

export const SignIn = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<Partial<ISignInData>>({});
    const navigate = useNavigate();

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    }


    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }

    const handleSubmit = (e: SubmitEvent) => {
        e.preventDefault();
        const { data, error } = validateSignIn({ email, password })
        setErrors({})
        if (error) {
            setErrors(data);
            return;
        }
        const fn = async () => {
            try {
                const res = await fetch("http://localhost:3000/api/v1/signIn", {
                    method: 'post',
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                if (res.status === 200) {
                    const result = await res.json()
                    localStorage.setItem("auth-user", result.user || "");
                    localStorage.setItem("auth-token", result.token || "")
                    navigate("/");
                    return;
                }
            } catch (e) {
                alert("Somethign went wrong!");
                console.log("Error", e);
            }
        }
        fn();
    }

    return <>
        <form onSubmit={handleSubmit}>
            <h2>Sign-In</h2>
            <h4>Welcome back to ollama chat!</h4>
            <div>
                <label>Email:
                    <input type="email" onChange={handleEmailChange} />
                    {errors["email"] && <div style={{ color: 'red' }}>{errors["email"]}</div>}
                </label>
            </div>
            <div>
                <label>password:
                    <input type="password" onChange={handlePasswordChange} />
                    {errors["password"] && <div style={{ color: 'red' }}>{errors["password"]}</div>}
                </label>
            </div>
            <button type="submit">SignIn</button>
        </form>
    </>
}
