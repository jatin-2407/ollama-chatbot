import { BrowserRouter } from "react-router-dom";
import { useAuth } from "../Contexts/authContext"
import { PrivateRoutes } from "../routes/privateRoutes";
import { PublicRoutes } from "../routes/publicRoutes";


export const RoutesProvider = () => {

    const auth = useAuth();
    return <BrowserRouter>
        {auth.isLoggedIn ? <PrivateRoutes /> : <PublicRoutes />}
    </BrowserRouter>

}