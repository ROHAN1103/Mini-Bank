let previousData = [];
let emptyData = [];
let visited = [999, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
let loanCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let doubleupload = false;
let no_loan_member=[];

//date related 
function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Ensure 2-digit month
    const day = today.getDate().toString().padStart(2, '0');          // Ensure 2-digit day
    return `${day}-${month}-${year}`;
}
function getMonth() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Ensure 2-digit month
    return `${month}-${year}`;
}

function excelDateToJSDate(serial) {
    // Excel's date system starts on 1 Jan 1900
    const excelStartDate = new Date(1900, 0, 1);
    // Subtract 1 (because Excel counts 1st Jan 1900 as 1) and add the serial days
    const jsDate = new Date(excelStartDate.getTime() + (serial - 1) * 86400000); // 86400000 ms in a day
    return jsDate;
}

function formatDate(jsDate) {
    //const day = String(jsDate.getDate()).padStart(2, '0');
    const month = String(jsDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = jsDate.getFullYear();
    return `${month}-${year}`;
}

const getdate = getCurrentDate();
document.getElementById('addMonth').textContent = getdate || "N/A";

//function to read the file
function readExcel(file, callback) {
    try {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                callback(json);
            } catch (error) {
                alert(`Error processing the file: ${error.message}`);
            }
        };
        reader.onerror = () => {
            alert("Error reading the file. Please ensure it's a valid Excel file.");
        };
        reader.readAsArrayBuffer(file);
    } catch (error) {
        alert(`Unexpected error: ${error.message}`);
    }
}

// Load previous transactions
document.getElementById('previousFile').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        alert("Invalid file type. Please upload a valid Excel file (.xlsx).");
        return;
    }
    readExcel(file, (data) => {
        if (data.length === 0) {
            alert("The uploaded file is empty. Please provide a valid file.");
            return;
        }
        previousData = data.slice(1); // Exclude header
        alert('ಫೈಲ್ ಲೋಡಿಂಗ್ ಯಶಸ್ವಿಯಾಗಿದೆ.');
    });
    
});

// Load empty file
document.getElementById('monthlyFile').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        alert("Invalid file type. Please upload a valid Excel file (.xlsx).");
        return;
    }
    readExcel(file, (data) => {
        if (data.length === 0) {
            alert("The uploaded file is empty. Please provide a valid file.");
            return;
        }
        emptyData = data.slice(1); // Exclude header
        const attendence = parseInt(emptyData[20][1]);
        const ts = parseFloat(emptyData[20][7]);// checking for non empty upload file.
        if (attendence != 0 || ts != 0) {
            if (confirm('ನಿಮ್ಮ ಫೈಲ್ ಈಗಾಗಲೇ  ಅಪ್ಡೇಟ್ ಆಗಿದೆ, ನೀವು ಮುಂದುವರಿಸಲು ಬಯಸುವಿರಾ')) {
                doubleupload = true;
                alert('ಫೈಲ್ ಲೋಡಿಂಗ್ ಯಶಸ್ವಿಯಾಗಿದೆ.');
                for (i = 0; i < 20; i++) {
                    if (emptyData[i][7] != 0) {
                        visited[i + 1] = 0;
                    }
                    const cd = getMonth();
                    if (emptyData[i][8] == cd) {
                        loanCount[i + 1] = emptyData[i][6];
                    }
                }
            }
            else {
                monthlyFile.value = "";
                return;
            }
        }
        else {
            alert('ಫೈಲ್ ಲೋಡಿಂಗ್ ಯಶಸ್ವಿಯಾಗಿದೆ.');
        }
        load_marqee();
        load_noLoan();
        const x = parseFloat(previousData[25][2]) + 200;
        emptyData[25][2] = x;
        document.getElementById('isave').textContent = x || NaN;
        emptyData[21][2] = previousData[24][2];
        attendence_sum();
    });
});

//attendence and summary
function attendence_sum() {
    let count = 0;
    for (i = 0; i <= 20; i++) {
        if (visited[i] == 0) {
            count = count + 1;
        }
    }
    document.getElementById('attendance').textContent = count;
    emptyData[20][1] = count;
    document.getElementById('totalSavings').textContent = emptyData[20][2];
    document.getElementById('totalInterest').textContent = emptyData[20][4];
    document.getElementById('totalPayback').textContent = emptyData[20][5];
    document.getElementById('totalLoanLeft').textContent = emptyData[20][6];
    document.getElementById('grandTotal').textContent = emptyData[20][7];
}

//load marquee
function load_marqee() {
    let marquee = [];
    for (i = 0; i <= 20; i++) {
        if (visited[i] == 0) {
            marquee.push(emptyData[i - 1][1]);
            marquee.push("    ");
        }
    }
    document.getElementById('marquee').textContent = marquee;
}
//load no_loan
function load_noLoan(){
    for(i=0;i<20;i++){
        if(previousData[i][8]=="NaN"){
            no_loan_member.push(previousData[i][1]+"    ");
        }
    }
    document.getElementById('marquee2').textContent = no_loan_member;
}

//clear input
function clearInput() {
    document.getElementById('payback').value = ""; // Clear the input field
    document.getElementById('total').textContent = "";
    document.getElementById('remainingLoan').textContent = "";
}
function clearOutput() {
    document.getElementById('slno').textContent = "";
    document.getElementById('name').textContent = "";
    document.getElementById('loan').textContent = "";
    document.getElementById('interest').textContent = "";
}

//find details
document.getElementById('findDetails').addEventListener('click', () => {
    try {
        const serial = document.getElementById('serialNumber').value;
        if (!serial) {
            alert("ದಯವಿಟ್ಟು ಸರಿಯಾದ ಸದಸ್ಯತ್ವ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.");
            document.getElementById('serialNumber').value = "";
            return;
        }
        clearInput();
        if (visited[serial] == 0) {
            if (loanCount[serial] != 0) {
                alert('ಈ ಸದಸ್ಯರ ಡೇಟಾವನ್ನು ಅಪ್ಡೇಟ್ ಮಾಡಲು ಸಾದ್ಯವಿಲ್ಲ.');
                return;
            }
            if (confirm('ಈ ಸದಸ್ಯನ ಡೇಟಾ ಒಮ್ಮೆ ಅಪ್ಡೇಟ್ ಮಾಡಲಾಗಿದೆ, ಮತ್ತೆ ಅಪ್ಡೇಟ್ ಮಾಡಲು ಇಚ್ಚಿಸುವಿರ?')) {
                const member = previousData.find(row => row[0] == serial);
                if (member) {
                    document.getElementById('slno').textContent = serial || "N/A";
                    document.getElementById('name').textContent = member[1] || "N/A";
                    document.getElementById('loan').textContent = member[6] || 0;
                    document.getElementById('interest').textContent = (member[6] * 0.01).toFixed(2);
                } else {
                    alert('ನೀವು ನಮೂದಿಸಿರುವ ಸಂಖ್ಯೆ ತಪ್ಪಾಗಿದೆ.');
                    document.getElementById('serialNumber').value = "";
                    clearOutput();
                    clearInput();
                }
                const field = document.getElementById('payback');
                if (payback > member[6]) {
                    alert('ಗಮನಿಸಿ ಮರುಪಾವತಿಯ ಮೊತ್ತವೂ ಸಾಲಕಿಂತ ಹೆಚ್ಚಿದೆ.');
                    document.getElementById('payback').value = "";
                }
                if (member[6] <= 0) {
                    field.disabled = true;
                } else {
                    field.disabled = false;
                }
            }
            else {
                return;
            }
        }
        else {
            const member = previousData.find(row => row[0] == serial);
            if (member) {
                document.getElementById('slno').textContent = serial || "N/A";
                document.getElementById('name').textContent = member[1] || "N/A";
                document.getElementById('loan').textContent = member[6] || 0;
                document.getElementById('interest').textContent = (member[6] * 0.01).toFixed(2);
            } else {
                alert('ನೀವು ನಮೂದಿಸಿರುವ ಸಂಖ್ಯೆ ತಪ್ಪಾಗಿದೆ!');
                document.getElementById('serialNumber').value = "";
                clearOutput();
                clearInput();
            }
            const field = document.getElementById('payback');
            if (member[6] <= 0) {
                field.disabled = true;
            } else {
                field.disabled = false;
            }
        }


    } catch (error) {
        alert(`Error finding member details: ${error.message}`);
    }
});

//Get total
document.getElementById('getTotal').addEventListener('click', () => {
    try {
        const payback = parseFloat(document.getElementById('payback').value) || 0;
        const loan = parseFloat(document.getElementById('loan').textContent) || 0;
        const interest = parseFloat(document.getElementById('interest').textContent) || 0;
        const total = 200 + interest + payback;
        if(payback>loan){
            alert('ಸಾಲಕಿಂತ ಮರುಪಾತಿ ಜಾಸ್ತಿ ಆಗಿದೆ.');
            document.getElementById('payback').value="";
            return;
        }

        document.getElementById('total').textContent = total.toFixed(2);
        document.getElementById('remainingLoan').textContent = (loan - payback).toFixed(2);
    } catch (error) {
        alert(`Error calculating totals: ${error.message}`);
    }
});

//update data
document.getElementById('update').addEventListener('click', () => {
    update_summary();
});

function update_summary() {
    try {
        const slno = document.getElementById('slno').textContent;
        const sav = 200;
        const loan = parseFloat(document.getElementById('loan').textContent);
        const interest = parseFloat(document.getElementById('interest').textContent);
        const pay = parseFloat(document.getElementById('payback').value) || 0;
        const rem_loan = parseFloat(document.getElementById('remainingLoan').textContent);
        const total = parseFloat(document.getElementById('total').textContent);
        if (!slno) {
            alert("ದಯವಿಟ್ಟು ಸರಿಯಾದ ಸದಸ್ಯತ್ವ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.");
            document.getElementById('serialNumber').value = "";
            return;
        }
        // if (doubleupload) {
        //     for (i = 0; i < 20; i++) {
        //         if (emptyData[i][7] != 0) {
        //             visited[i + 1] = 0;
        //         }
        //     }
        // }
        const rowIndex = emptyData.findIndex(row => row[0] == slno);
        const that_date = previousData[rowIndex][8];
        if (rowIndex > -1) {
            if (visited[slno] == 0) {
                const ds = emptyData[rowIndex][2];
                const dl = emptyData[rowIndex][3];
                const di = emptyData[rowIndex][4];
                const dp = emptyData[rowIndex][5];
                const dr = emptyData[rowIndex][6];
                const dt = emptyData[rowIndex][7];
                calculate_sub(ds, dl, di, dp, dr, dt);
            }
            emptyData[rowIndex][2] = sav;
            emptyData[rowIndex][3] = loan;
            emptyData[rowIndex][4] = interest;
            emptyData[rowIndex][5] = pay;
            emptyData[rowIndex][6] = rem_loan;
            emptyData[rowIndex][7] = total;
            if (rem_loan == 0) {
                emptyData[rowIndex][8] = "NaN";
            }
            else {
                let f_date = "06-11-2011";
                if (!isNaN(that_date)) {
                    const jsDate = excelDateToJSDate(that_date);
                    f_date = formatDate(jsDate);
                } else {
                    console.error("Invalid Excel date serial");
                }
                emptyData[rowIndex][8] = f_date;
            }

            calculate_add(sav, loan, interest, pay, rem_loan, total);
            alert('ಡೇಟಾವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!')
            visited[slno] = 0;
            attendence_sum();
            load_marqee();
            if (confirm("ಈ ವಿವರವನ್ನು ಸದಸ್ಯರಿಗೆ SMS ಮೂಲಕ ಕಳಿಸಲು ಇಚ್ಚಿಸುವಿರ ?") == true) {
                sendSMS();
            } else {
                text = "message not sent";
            }

        }
        else {
            alert('cannot updated');
        }

    }
    catch (error) {
        alert(`Error updating file: ${error.message}`);
    }
}

function sendSMS() {
    const phoneNumbers = ["+910", "+919448226897", "+919449741321", "+917676218292", "+919481950080", "+919482203366", "+919945238395", "+919481347820", "+919481612303", "+918147249762", "+919972361217", "+918762652838",
        "+919731116656", "+919986375999", "+919448226897", "+919483689422", "+919480976675", "+919482495361", "+919483220796", "+919483220796", "+918277312584"];
    const sno = document.getElementById('slno').textContent;
    const name = document.getElementById('name').textContent;
    const gtotal = parseFloat(document.getElementById('totalSavings').textContent);
    //total interest
    const interest = parseFloat(document.getElementById('interest').textContent) || 0;
    const pbk = parseFloat(document.getElementById('payback').value) || 0;
    //total loan left
    const tll = parseFloat(document.getElementById('remainingLoan').textContent) || 0;
    const phoneNumber = phoneNumbers[sno];
    alert(phoneNumber);
    const x = parseFloat(document.getElementById('isave').textContent) || NAN;
    const message = "ಆತ್ಮೀಯ " + name + ",\n" +
        "ಈ ಸಂದೇಶವು ಶ್ರೀ ವಿಶ್ವಕರ್ಮ ಸ್ವಸಹಾಯ ಸಂಘದ ಪರವಾಗಿ,\n" +
        "ನಿಮ್ಮ ಈ ತಿಂಗಳ ವಹಿವಾಟಿನ ವಿವರ::\n" +
        "ಈ ತಿಂಗಳ ಉಳಿತಾಯ: " + gtotal + ",\n" +
        "ಬಡ್ಡಿ: " + interest + ",\n" +
        "ಸಾಲ ಮರುಪಾವತಿ: " + pbk + ",\n" +
        "ಬಾಕಿ ಸಾಲ: " + tll + ",\n" +
        "ನಿಮ್ಮ ಇಲ್ಲಿಯವರೆಗಿನ ಉಳಿತಾಯ: " + x + ".";
    if (!phoneNumber) {
        alert("Cannot send message.");
        return;
    }

    // Use the sms: URI to open the SMS app
    window.location.href = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
}


//calculate function
function calculate_add(s, l, i, p, r, t) {
    emptyData[20][2] = (parseFloat(emptyData[20][2]) + s).toFixed(2);
    emptyData[20][3] = (parseFloat(emptyData[20][3]) + l).toFixed(2);
    emptyData[20][4] = (parseFloat(emptyData[20][4]) + i).toFixed(2);
    emptyData[20][5] = (parseFloat(emptyData[20][5]) + p).toFixed(2);
    emptyData[20][6] = (parseFloat(emptyData[20][6]) + r).toFixed(2);
    emptyData[20][7] = (parseFloat(emptyData[20][7]) + t).toFixed(2);
    emptyData[24][2] = (parseFloat(emptyData[24][2]) + t).toFixed(2);

}
function calculate_sub(s, l, i, p, r, t) {
    emptyData[20][2] = emptyData[20][2] - s;
    emptyData[20][3] = emptyData[20][3] - l;
    emptyData[20][4] = emptyData[20][4] - i;
    emptyData[20][5] = emptyData[20][5] - p;
    emptyData[20][6] = emptyData[20][6] - r;
    emptyData[20][7] = emptyData[20][7] - t;
    emptyData[24][2] = emptyData[24][2] - t;
}

//save 
document.getElementById('save').addEventListener('click', () => {
    try {
        if (emptyData.length === 0) {
            alert("No data to save. Please update the file first.");
            return;
        }
        const workbook = XLSX.utils.book_new();
        const sheet = XLSX.utils.aoa_to_sheet([
            ['Sl.No', 'Name', 'Savings', 'Loan', 'Interest', 'Payback', 'Loan Left', 'Total'],
            ...emptyData,
        ]);
        XLSX.utils.book_append_sheet(workbook, sheet, 'Updated Data');
        const currentDate = getCurrentDate();
        XLSX.writeFile(workbook, `${currentDate}.xlsx`);
        alert('File saved successfully.');
    } catch (error) {
        alert(`Error saving file: ${error.message}`);
    }
});

//Loan
document.getElementById('crt').addEventListener('click', () => {
    try {
        const slno = parseFloat(document.getElementById('sNum').value);
        const amt = parseFloat(document.getElementById('amt').value);
        const old_bal = parseFloat(previousData[24][2]);
        if (!slno) {
            alert("ದಯವಿಟ್ಟು ಸರಿಯಾದ ಸದಸ್ಯತ್ವ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.");
            document.getElementById('sNum').value = "";
            return;
        } else {
            const rowIndex = emptyData.findIndex(row => row[0] == slno);
            const total_amt = parseFloat(emptyData[24][2]);
            const will_remain = total_amt + old_bal - amt;
            if (emptyData[rowIndex][2] == 0 && emptyData[rowIndex][7] == 0) {
                alert('ಈ ಸದಸ್ಯನು ಈ ತಿಂಗಳ ವಹಿವಾಟನ್ನು ಇನ್ನು ನಡೆಸಿಲ್ಲ, ಮೊದಲು ಅದನ್ನು ಮುಗಿಸಿ ಪುನಃ ಬನ್ನಿ.');
                clearLoanDetails();
                return;
            }
            if (will_remain > 2000) {
                // alert(will_remain);
                if (check_condition(rowIndex) || check_condition2(rowIndex)) {
                    // alert('passed');
                    if (confirm('ಸಾಲ ನೀಡಿದ ನಂತರ ರೂ.' + will_remain + ' ಮಾತ್ರ ಖಾತೆಯಲ್ಲಿ ಉಳಿಯುತ್ತದೆ.')) {
                        if (confirm('ರೂ.' + amt + 'ಅನ್ನು ಸಾಲವಾಗಿ ' + emptyData[slno - 1][1] + ' ಅವರಿಗೆ ಕೊಡಲಾಗುವುದು.')) {
                            emptyData[rowIndex][6] = amt;
                            emptyData[rowIndex][8] = getMonth();
                            const tempo = parseFloat(emptyData[20][6]) + parseFloat(amt);
                            emptyData[20][6] = parseFloat(tempo);
                            // alert(emptyData[20][6]);
                            loanCount[slno] = amt;
                            alert('ಸಾಲ ಯಶಸ್ವಿಯಾಗಿ ಹಂಚಿಕೆ ಮಾಡಲಾಗಿದೆ.');
                            emptyData[24][2] = emptyData[24][2] - amt;
                        }else{
                            return;
                        }
                    }
                    else {
                        clearLoanDetails();
                        return;
                    }

                } else {
                    alert('ಈ ಸದಸ್ಯ ಈಗಾಗಲೇ ಸಾಲ ತಗೆದುಕೊಂಡಿರುತ್ತಾರೆ, ಆ ಸಾಲವೂ ಇನ್ನು ತೀರಿಲ್ಲ.');
                    clearLoanDetails();
                    return;
                }
            } else {
                alert('ಸಾಲ ನೀಡಲು ಹಣ ಸಾಕಾಗುವುದಿಲ್ಲ.');
                clearLoanDetails();
                return;
            }

        }

    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

function check_condition(x) {
    // alert('condition 01');
    if (previousData[x][3] == 0 && previousData[x][8] == "NaN") {
        return true;
    } else {
        return false;
    }
}
function check_condition2(x) {
    if (emptyData[x][6] == 0 && emptyData[x][8] == "NaN") {
        if (confirm('ಈ ಸದಸ್ಯನೂ ಇಂದು ಸಾಲ ತೀರಿಸಿರುತ್ತಾರೆ, ಪುನಃ ಸಾಲ ವಿತರಿಸಲು ಇಚಿಸುತ್ತೀರ.')) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function clearLoanDetails() {
    const x1 = document.getElementById('amt');
    x1.value = ""; // Clear the input field
    const x2 = document.getElementById('sNum');
    x2.value = ""; // Clear the input field
}
document.getElementById('clr').addEventListener('click', () => {
    clearLoanDetails();
});



//final summary
document.getElementById('finalize').addEventListener('click', () => {
    try {
        t_date = getMonth();
        document.getElementById('fobb').textContent = parseFloat(previousData[24][2]) || 0;
        document.getElementById('ftotalSavings').textContent = parseFloat(emptyData[20][2]);
        document.getElementById('ftotalInterest').textContent = parseFloat(emptyData[20][4]);
        document.getElementById('ftotalpayback').textContent = parseFloat(emptyData[20][5]);
        document.getElementById('ftotalAmt').textContent = parseFloat(emptyData[20][7]);
        if (doubleupload) {
            for (i = 0; i < 20; i++) {
                if (emptyData[i][8] == t_date) {
                    const no = emptyData[i][0];
                    loanCount[no] = emptyData[i][6];
                }
            }
        }
        document.getElementById('fLoanAmt').textContent = gettotal(loanCount);
        emptyData[23][2] = gettotal(loanCount);
    } catch (error) {
        alert(`Error summarizing: ${error.message}`);
    }
});

//get total function
function gettotal(x) {
    let sum = 0;
    for (let i = 0; i < x.length; i++) {
        sum = sum + x[i];
    }
    return sum;
}

document.getElementById('calculate').addEventListener('click', () => {
    try {
        const fobb = parseFloat(document.getElementById('fobb').textContent);
        const ts = parseFloat(document.getElementById('ftotalAmt').textContent);
        const loan = parseFloat(document.getElementById('fLoanAmt').textContent);
        let o_ther = parseFloat(document.getElementById('others').value);
        if (doubleupload) {
            o_ther = o_ther + parseFloat(emptyData[22][2]);
        }
        emptyData[22][2] = o_ther;
        const hero = fobb + ts + o_ther - loan;
        // alert(fobb+','+ts+','+loan+','+o_ther+','+hero);
        document.getElementById('fnbb').textContent = hero;
    }
    catch (error) {
        alert(`Error in ${error.message}`);
    }
});
