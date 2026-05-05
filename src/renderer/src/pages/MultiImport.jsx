import React from 'react'
import BulkImport from '../components/bulkImport/BulkImport'
import { localStorageGetItem } from '../utils/GlobalFunction';

const MultiImport = () => {
    const user_id = localStorageGetItem("userId");
    return (
        <>
            <BulkImport user_id={user_id} />
        </>
    )
}

export default MultiImport