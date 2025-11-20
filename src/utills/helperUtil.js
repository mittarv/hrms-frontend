export const sortMainLeaderboardReferralData = (data) => {
    return data.slice().sort((a, b) => {
        //for employee with referral soritng based on the first level first and then by second level parameter
        const firstLevelComparison = parseInt(b.firstLevelSum) - parseInt(a.firstLevelSum);
        if (firstLevelComparison !== 0) {
            return firstLevelComparison;
        }

        const secondLevelComparison = parseInt(b.secondLevelSum) - parseInt(a.secondLevelSum);
        if (secondLevelComparison !== 0) {
            return secondLevelComparison;
        }

        //for employee w/o any referral sorting alphabetically
        return a.userName.localeCompare(b.userName);
    });
};

export const sortWinnerReferralData = (data) => {
    // filtering out and removinfg employees with zero first level referrals
    const filteredData = data.filter(employee => parseInt(employee.firstLevelSum) > 0);

    return filteredData.slice().sort((a, b) => {
       //sorting based on the firstlevel parameter
        const firstLevelComparison = parseInt(b.firstLevelSum) - parseInt(a.firstLevelSum);
        if (firstLevelComparison !== 0) {
            return firstLevelComparison;
        }
        return 0;
    });
};
