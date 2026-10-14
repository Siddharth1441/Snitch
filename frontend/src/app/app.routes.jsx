import { createBrowserRouter } from "react-router";
import Register from "../features/auth/pages/Register.jsx";
import Login from "../features/auth/pages/Login.jsx";
import CompleteProfile from "../features/auth/pages/CompleteProfile.jsx";
import Home from "../features/home/pages/Home.jsx";
import Profile from "../features/home/pages/Profile.jsx";
import CreateProduct from "../features/products/pages/CreateProduct.jsx";
import Dashboard from "../features/products/pages/dashboard.jsx";
import ProtectedRoute from "../features/auth/components/ProtectedRoute.jsx";
import ProductDetail from "../features/home/pages/productDetail.jsx";
import SellerProductDetails from "../features/products/pages/sellerProductDetails.jsx";
import Cart from "../features/cart/pages/cart.jsx";
import OrderSuccess from "../features/cart/pages/OrderSuccess.jsx";
import Shop from "../features/shop/pages/Shop.jsx";
import InfoPage from "../features/shop/pages/InfoPage.jsx";
import Wishlist from "../features/wishlist/pages/Wishlist.jsx";

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/shop",
        element: <Shop />
    },
    {
        path: "/wishlist",
        element: <Wishlist />
    },
    {
        path: "/about",
        element: <InfoPage />
    },
    {
        path: "/shipping",
        element: <InfoPage />
    },
    {
        path: "/returns",
        element: <InfoPage />
    },
    {
        path: "/faq",
        element: <InfoPage />
    },
    {
        path: "/contact",
        element: <InfoPage />
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
        path: "/complete-profile",
        element: <CompleteProfile />
    },
    {
        path: "/profile",
        element: <Profile />
    },
    {
        path:"/product/:productId",
        element: <ProductDetail />
    },
    {
        path: "/cart",
        element: <Cart />
    },
    {
        path: "/order-success",
        element: <OrderSuccess />
    },
    {
        path: "/seller",
        element: <ProtectedRoute />,
        children: [
            {
                index: true,
                element: <Dashboard />
            },
            {
                path: "dashboard",
                element: <Dashboard />
            },
            {
                path: "create-product",
                element: <CreateProduct />
            },
            {
                path: "dashboard/product/:productId",
                element: <SellerProductDetails />
            },
            {
                path: "product/:productId",
                element: <SellerProductDetails />
            }
        ]
    }
    
]);