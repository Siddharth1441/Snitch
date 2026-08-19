import { createBrowserRouter } from "react-router";
import Register from "../features/auth/pages/Register.jsx";
import Login from "../features/auth/pages/Login.jsx";
import Home from "../features/home/pages/Home.jsx";
import CreateProduct from "../features/products/pages/CreateProduct.jsx";

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/create-product",
        element: <CreateProduct />
    }
]);