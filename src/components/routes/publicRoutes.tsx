import { Routes, Route, Navigate } from "react-router-dom"
import { Signup } from "../pages/Signup";
import { SignIn } from "../pages/SignIn";

export const PublicRoutes = () => {

    return <>
        <Routes>
            <Route path="/login" element={<SignIn />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to='/login' />} />
        </Routes>
    </>

}