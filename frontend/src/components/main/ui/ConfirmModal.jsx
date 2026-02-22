import { motion } from "framer-motion";
import Button from "../../Button";

const ConfirmModal = ({ onCancel, onConfirm, title = '', description = '', primaryButtonVariant = 'primary', action = 'Confirm' }) => {
    
    return (

        <motion.div
            className="fixed inset-0 flex items-center justify-center bg-grey/40 backdrop-blur-sm z-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-card p-6 rounded-2xl w-80 space-y-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                <h3 className="font-semibold text-lg">
                    {title}
                </h3>

                <p className="text-sm text-muted">
                    {description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-4">
                    <Button 
                        size="small"
                        variant="secondary" 
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>

                    <Button 
                        size="small"
                        variant={primaryButtonVariant} 
                        onClick={onConfirm}
                    >
                        {action}
                    </Button>
                </div>
            </motion.div>
            
        </motion.div>

    );
};

export default ConfirmModal;