import React, { useState, useRef } from "react";
import ExcelJS from "exceljs";
import * as bip39 from "bip39";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { multiImportWallets } from "../../blockchain/wallets/Wallet";

const MAX_ROWS = 10;

const BulkImport = ({ user_id }) => {
    const [passphrases, setPassphrases] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorRows, setErrorRows] = useState([]);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleTextChange = (e) => {
        setPassphrases(e.target.value);
        // Clear error rows when user types
        setErrorRows([]);
    };

    const validatePassphrases = () => {
        if (!passphrases.trim()) {
            toast.error("Please enter passphrases");
            return null;
        }

        // Split by new lines and filter empty lines
        const lines = passphrases.split('\n').filter(line => line.trim() !== '');

        if (lines.length === 0) {
            toast.error("No passphrases entered");
            return null;
        }

        if (lines.length > MAX_ROWS) {
            toast.error(`Maximum ${MAX_ROWS} passphrases allowed`);
            return null;
        }

        const validPassphrases = [];
        const errors = [];

        lines.forEach((line, index) => {
            const passPhrase = line
                .toString()
                .trim()
                .toLowerCase()
                .replace(/\s+/g, " ");

            if (!bip39.validateMnemonic(passPhrase)) {
                errors.push({
                    row: index + 1,
                    passPhrases: [passPhrase],
                    error: "Invalid mnemonic"
                });
            } else {
                validPassphrases.push(passPhrase);
            }
        });

        if (errors.length > 0) {
            setErrorRows(errors);
            return { valid: validPassphrases, errors };
        }

        return { valid: validPassphrases, errors: [] };
    };

    const downloadErrorExcel = async (errors) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Invalid Mnemonics");

        worksheet.columns = [
            { header: "Row Number", key: "row", width: 15 },
            { header: "Mnemonic", key: "mnemonic", width: 70 },
            { header: "Error", key: "error", width: 30 },
        ];

        errors.forEach((item) => {
            worksheet.addRow({
                row: item.row,
                mnemonic: item.passPhrases?.[0] || "",
                error: item.error,
            });
        });

        worksheet.getRow(1).font = { bold: true };

        const buffer = await workbook.xlsx.writeBuffer();

        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Invalid_Mnemonics.xlsx";
        link.click();
    };

    const handleSubmit = async () => {
        const validationResult = validatePassphrases();

        if (!validationResult) return;

        const { valid, errors: initialErrors } = validationResult;

        if (valid.length === 0 && initialErrors.length === 0) {
            toast.error("No passphrases entered");
            return;
        }

        try {
            setLoading(true);
            
            const lines = passphrases.split('\n').filter(line => line.trim() !== '');
            const res = await multiImportWallets(lines);

            const { importedCount, invalidMnemonics } = res;

            if (importedCount > 0) {
                toast.success(`${importedCount} wallets imported successfully`);
            }

            if (invalidMnemonics.length > 0) {
                toast.error(`${invalidMnemonics.length} invalid passphrase(s) found`);
                await downloadErrorExcel(invalidMnemonics);
            }

            if (importedCount > 0) {
                navigate("/app/wallets");
                setPassphrases("");
                setErrorRows([]);
            }

        } catch (error) {
            console.error("Bulk import error:", error);
            toast.error(error?.message || "Import failed");
        } finally {
            setLoading(false);
        }
    };

    const handleClearAll = () => {
        setPassphrases("");
        setErrorRows([]);
        toast.success("Cleared all");
    };

    return (
        <div className="max-w-7xl mx-auto mt-6 space-y-6">
            <div className='flex items-center gap-3'>
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                            d="M12 4L6 10L12 16"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
                <h1 className='text-xl font-bold'>Bulk Import</h1>
            </div>

            <div className="relative bg-borderColor border border-borderColor shadow-2xl rounded-2xl p-8">
                {loading && (
                    <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm text-gray-300">Processing...</p>
                        </div>
                    </div>
                )}

                <div className="space-y-5">
                    <label className="text-sm text-gray-400 block">
                        Enter passphrases (one per line, max {MAX_ROWS} lines)
                    </label>

                    <textarea
                        value={passphrases}
                        onChange={handleTextChange}
                        placeholder={`Enter your passphrases here...\nExample:\nabandon ability about above absent\nactual adapt add addict address\n\nMax ${MAX_ROWS} lines allowed`}
                        className="w-full h-64 p-4 bg-transparent border border-zinc-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none"
                        disabled={loading}
                    />

                    {/* Line counter */}
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">
                            {passphrases.split('\n').filter(line => line.trim() !== '').length} / {MAX_ROWS} lines
                        </span>
                        {passphrases && (
                            <button
                                onClick={handleClearAll}
                                className="text-red-400 hover:text-red-300 transition"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* Error summary */}
                    {errorRows.length > 0 && (
                        <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm font-medium mb-1">
                                Found {errorRows.length} invalid passphrase(s):
                            </p>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {errorRows.map((error, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-xs">
                                        <span className="text-red-400 font-mono">Row {error.row}:</span>
                                        <span className="text-gray-400 font-mono truncate">
                                            {error.passPhrases[0].substring(0, 30)}...
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={loading || !passphrases.trim()}
                className="mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-6 rounded-lg transition flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    "Import Wallets"
                )}
            </button>

            {/* Instructions */}
            <div className="mt-4 text-xs text-gray-500">
                <p>• Enter one passphrase per line</p>
                <p>• Maximum {MAX_ROWS} passphrases at a time</p>
                <p>• Invalid passphrases will be downloaded as an Excel file</p>
            </div>
        </div>
    );
};

export default BulkImport;