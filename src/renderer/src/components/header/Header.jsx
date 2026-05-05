import { useLocation, useNavigate } from "react-router-dom";
import CustomButton from "../Buttons/CustomButton";
import { Fade } from "react-awesome-reveal";
import { MdMenu } from "react-icons/md";
import logo from "../../../public/logoDWM.png"

const Header = ({ isButton = true, setSidebarOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const hideMenuOnRoutes = ["/", "/setup", "/app/verify-backup", "/app/backup"];

    const shouldHideMenu = hideMenuOnRoutes.includes(location.pathname);
    return (
        <Fade duration={500} direction="down" triggerOnce>
            <header className="flex items-center justify-between py-6 px-4 md:px-9  border-b border-borderColor bg-primaryTheme">

                {/* Logo */}
                <div className="lg:hidden flex items-center gap-3">
                    {!shouldHideMenu && (
                        <button onClick={() => setSidebarOpen(true)} className="btn-glass">
                            <MdMenu size={22} />
                        </button>
                    )}
                    {/* <h1 className="text-xl font-bold text-success tracking-wider">TRAZOR</h1> */}
                    <div className="bg-white p-2 rounded-lg">
                        <img src={logo} alt="logo" className="h-6" />
                    </div>
                </div>
                {/* <h1 className="hidden lg:flex text-xl font-bold text-success tracking-wider">
                    TRAZOR
                </h1> */}
                <div className="hidden lg:flex bg-white p-1 rounded-lg">
                    <img src={logo} alt="logo" className="h-6" />
                </div>

                {isButton && (
                    <CustomButton
                        label="Get Started"
                        onClick={() => navigate("/setup")}
                    />
                )}

            </header>
        </Fade>
    );
};

export default Header;