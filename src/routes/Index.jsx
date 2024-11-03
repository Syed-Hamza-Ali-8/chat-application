import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom";
import LoginForm from "../pages/Login";
import SignupForm from "../pages/SignUp";
import ProtectedRoutes from "../routes/ProtectedRoutes";
import ChatApp from "./Chat";

export const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route element={<LoginChecker />}>
                <Route path="/signup" element={<SignupForm />} />
                <Route path="/login" element={<LoginForm />} />
            </Route>
            <Route element={<ProtectedRoutes />}>
                <Route path="/" element={<ChatApp />} />
            </Route>
        </>
    )
);
