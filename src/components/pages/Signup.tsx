import { signupRequestValidationSchema } from '@/validations/schemas';
import { useState, type ChangeEvent, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom';
import z, { email, refine, string, unknown } from 'zod';

interface ISingupData {
    name: string,
    email: string,
    password: string,
    confirmPassword: string
}

const validateSignup = (data: ISingupData): { error: boolean; data: Record<string, string> | ISingupData } => {

    const res = signupRequestValidationSchema.safeParse(data);

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


export const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<Partial<ISingupData>>({});
    const navigate = useNavigate();

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    }
    const handleName = (e: ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    }

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }

    const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
    }

    const handleSubmit = (e: SubmitEvent) => {
        e.preventDefault();
        const { data, error } = validateSignup({ name, email, confirmPassword, password })
        setErrors({})
        if (error) {
            setErrors(data);
            return;
        }
        const fn = async () => {
            try {
                const res = await fetch("http://localhost:3000/api/v1/signup", {
                    method: 'post',
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                if (res.status === 201) {
                    alert("Account created!");
                    navigate("/login");
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
            <h2>Signup</h2>
            <div>
                <label>name:
                    <input type="text" onChange={handleName} />
                    {errors["name"] && <div style={{ color: 'red' }}>{errors["name"]}</div>}
                </label>
            </div>
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
            <div>
                <label>Confirm password:
                    <input type="password" onChange={handleConfirmPasswordChange} />
                    {errors["confirmPassword"] && <div style={{ color: 'red' }}>{errors["confirmPassword"]}</div>}
                </label>
            </div>
            <button type="submit">Signup</button>
        </form>
    </>
}