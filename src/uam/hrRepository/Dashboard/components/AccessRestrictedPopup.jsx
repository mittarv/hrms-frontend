import { Dialog, DialogContent, Button, Typography } from "@mui/material";

const AccessRestrictedPopup = ({ isOpen }) => {
    return (
        <Dialog 
            open={isOpen} 
            disableEscapeKeyDown={true} 
            maxWidth="xs" 
            fullWidth
            PaperProps={{ style: { borderRadius: '16px', padding: '16px' } }}
        >
            <DialogContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: '700', mb: 2, color: '#033348', fontFamily: 'Inter, sans-serif' }}>
                    Access Restricted
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: '#5a6270', lineHeight: 1.5 }}>
                    Your employee profile has not been configured in the HRMS platform yet. Please contact your administrator to complete your onboarding.
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => {
                        window.location.href = "/";
                    }}
                    sx={{ 
                        backgroundColor: '#033348', 
                        color: 'white',
                        fontWeight: '600',
                        textTransform: 'none',
                        '&:hover': { backgroundColor: '#022230' }
                    }}
                >
                    Return to Home
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default AccessRestrictedPopup;
