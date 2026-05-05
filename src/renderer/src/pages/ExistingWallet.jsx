import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import ImportSecretPhrase from '../components/Import/ImportSecretPhrase';

const ExistingWallet = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const pin = location.state.pin

    return (
        <>
            <ImportSecretPhrase
                pin={pin}
                handleBack={() => navigate(-1)}
            />
        </>
    )
}

export default ExistingWallet