import { useState } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { Signup } from "../pages/Signup";
const LoginPage = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return <>
        <form>
            <h2>Login</h2>
            <h4>Welcome back to ollama chat!</h4>
            <div>
                <label>Email:
                    <input type="email" />
                </label>
            </div>
            <div>
                <label>password:
                    <input type="password" />
                </label>
            </div>
            <button type="submit">Login</button>
        </form>
    </>
}




export const PublicRoutes = () => {

    return <>
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to='/login' />} />
        </Routes>
    </>

}