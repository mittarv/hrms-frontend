import { useState } from 'react';
import { Table, TableBody, TableCell, TableRow, Tabs, Tab, Box } from "@mui/material";
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { hrRepositoryTableStyle as tableStyle } from '../../constant/hrRepositoryTableStyle';
import '../dashboard.scss';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const MyUpdates = () => {
  const { myUpdates, organizationUpdates } = useSelector((state) => state.hrRepositoryReducer);
  const [tabValue, setTabValue] = useState(0);
  const { MyUpdateStyle } = tableStyle;

  const handleChange = (event, newValue) => {
    event.preventDefault();
    setTabValue(newValue);
  };


  const renderTabPanel = (value, index, content) => {
    return value === index && <Box style ={{padding:"0px"}} p={3}>{content}</Box>;
  };


  const getTabStyle = (index) => ({
    color: tabValue === index ? "#2E3038" : "#676B7E",
    fontWeight: tabValue === index ? "700" : "500",
    fontSize: "16px",
    fontFamily: "Plus Jakarta Sans"
  });

  const emptyStateStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100px",
    color: "#888",
    fontSize: "18px",
    fontWeight: 500,
    textAlign: "center",
    fontFamily: "Plus Jakarta Sans",
    gap: "12px"
  };

  const EmptyUpdatesMessage = ({ message }) => (
    <div style={emptyStateStyle}>
      <Box display="flex" alignItems="center" gap={1} sx={{ color: "#888" }}>
        <MailOutlineOutlinedIcon sx={{ fontSize: 28 }} />
        <span>{message}</span>
      </Box>
      <Box display="flex" alignItems="center" gap={1} sx={{ color: "#888", fontSize: "16px" }}>
        <NotificationsNoneOutlinedIcon sx={{ fontSize: 22 }} />
        <span>We&apos;ll notify you when something exciting happens!</span>
      </Box>
    </div>
  );

  return (
    <div className='coverClass'>
    <div className="my-updates-container">
      <Tabs value={tabValue} onChange={handleChange}>
        <Tab style={getTabStyle(0)} label="My Updates" />
        <Tab style={getTabStyle(1)} label="Organizational Updates" />
      </Tabs>
  
      {renderTabPanel(
        tabValue,
        0,
        myUpdates.length > 0 ? (
          <Table>
            <TableBody>
              {myUpdates.map((my_updates, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell style={MyUpdateStyle}>
                      {my_updates?.message}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
            textAlign="center"
            p={3}
            color="#888"
            fontSize="22px"
            fontWeight={500}
            style={{ letterSpacing: "0.5px" }}
          >
            <EmptyUpdatesMessage message="No personal updates yet" />
          </Box>
        )
      )}
      {renderTabPanel(
        tabValue,
        1,
        organizationUpdates.length > 0 ? (
          <Table>
            <TableBody>
              {organizationUpdates.map((orgnaization_updates, index) => {
                let messageContent;
                try {
                  messageContent = typeof orgnaization_updates.message === 'string'
                    ? JSON.parse(orgnaization_updates.message)
                    : orgnaization_updates.message;
                } catch {
                  messageContent = null;
                }
                const isStructured = messageContent && typeof messageContent === 'object' && messageContent.linkUrl;
                return (
                  <TableRow key={index}>
                    <TableCell style={MyUpdateStyle}>
                      {isStructured ? (
                        <Link to={messageContent.linkUrl} className="update-link" style={{ color: '#2E3038' }}>
                          {messageContent.prefix}
                          <span style={{ fontWeight: 'bold' }}>&nbsp;{messageContent.linkText}&nbsp;</span>
                          {messageContent.suffix}
                        </Link>
                      ) : (
                        <span style={{ color: '#2E3038' }}>{orgnaization_updates.message}</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="100%"
            textAlign="center"
            p={3}
            color="#888"
            fontSize="22px"
            fontWeight={500}
            style={{ letterSpacing: "0.5px" }}
          >
            <EmptyUpdatesMessage message="No Organizational updates yet" />
          </Box>
        )
      )}
    </div>
  </div>

  );
};

export default MyUpdates;
