import { Navigate, Route, Routes } from "react-router-dom"
import { Chat } from "../pages/Chat"



export const PrivateRoutes = () => {

    return <Routes>
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:chat_id" element={<Chat />} />
        <Route path="*" element={<Navigate to='/chat' />} />
    </Routes>

}