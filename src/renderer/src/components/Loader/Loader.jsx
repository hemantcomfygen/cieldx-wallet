import "./Loader.css";

const Loader = ({ loading }) => {
    if (!loading) return null;

    return (
        <div className="absolute top-0 left-0 z-999999 h-screen w-full flex justify-center items-center bg-black/10 backdrop-blur-md">
            <span className="loader"></span>
        </div>
    );
};

export default Loader;