import { useState} from 'react';
import { Table, TableBody, TableCell, TableRow, Tabs, Tab, Box } from "@mui/material";
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
            <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100px",
            color: "#888",
            fontSize: "18px",
            fontWeight: 500,
            textAlign: "center",
            fontFamily: "Plus Jakarta Sans"
          }}>
            📬 No personal updates yet <br /> 🔔 We&apos;ll notify you when something exciting happens!
          </div>
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
                const messageContent = JSON.parse(orgnaization_updates.message);
                return (
                  <TableRow key={index}>
                    <TableCell style={MyUpdateStyle}>
                      <Link to={ messageContent?.linkUrl} className="update-link" style={{ color: '#2E3038' }}>
                        {messageContent?.prefix} 
                        <span style={{ fontWeight: 'bold' }}>&nbsp;{messageContent?.linkText}&nbsp;</span> 
                        {messageContent?.suffix}
                      </Link>
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
            
            <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100px",
            color: "#888",
            fontSize: "18px",
            fontWeight: 500,
            textAlign: "center",
            fontFamily: "Plus Jakarta Sans"
          }}>
            📬 No Organizational updates yet <br /> 🔔 We&apos;ll notify you when something exciting happens!
          </div>
          </Box>
        )
      )}
    </div>
  </div>

  );
};

export default MyUpdates;
