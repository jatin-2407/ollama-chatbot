import { Route, Routes } from "react-router-dom"

const Chat = () => <>this is chat page</>

export const PrivateRoutes = () => {

    return <Routes>
        <Route path="/chat/:chat_id" element={<Chat />} />
    </Routes>

}