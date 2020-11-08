const state = {};

// File Import CONTROLLER
var fileImportController = (function () {
    
    return {
        ProcessFile: (fName, OutputName) => {

        } 
    }
})();

class CSVFile {
    constructor (file) {
        this.file = file;
        this.csvData = [];
        this.csvDataObj = [];
    }
  
     blobObject = null;

     downloadFile(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
      
        element.style.display = 'none';
        document.body.appendChild(element);
      
        element.click();
      
        document.body.removeChild(element);
      }
    saveIntoCsv () {
        const outFileName = this.file.name.replace('.' + this.file.name.split('.').pop(), '.csv');
        this.downloadFile(outFileName, this.csvData)
    }

    readFileAsync(file) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = () => {
            resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsText(file);
        })
    }
    async processFile () {
        // read file
        try {
             
            let contentBuffer = await this.readFileAsync(this.file);
            this.lines = contentBuffer.split(/\r\n|\n/);
          } catch(err) {
            console.log(err);
          }
    }
    parseDataIntoCSV() {
        const getCSVObjAsText = (isHeader, obj) => {
            let result;
            result = '';
            for (const key in obj) {
                const element = obj[key];
                if (result) {
                    result += isHeader ? `, ${element.field}`: `, ${element.value}`;
                        
                } else {
                    result = isHeader ? `${element.field}`: `${element.value}`;
                }
            }
            return result;
        } 
        const csvFieldMapping = {
                               Identifier: {field:"Identifier", value:'', regExField:/^Identifier/gi, regExValue:/./ },
                               Timestamp: {field:"Timestamp", value:'', regExField: /Message\sTimestamp\s/gi, regExValue: /\d+-\d+-\d+\s\d+:\d+:\d+/}, 
                               MessageId: {field:"Message Id", value:'',  regExField:/^Message\sId\s/gi, regExValue:/\w+/}, 
                               SenderIp: {field:"Sender Ip", value:'', regExField:/^Sender\sIp\s/gi, regExValue:/\d+.\d+.\d+.\d+./}, 
                               SenderPort: {field:"Sender Port", value:'', regExField:/^Sender\sPort/gi, regExValue:/\d+/}, 
                               SenderDevice: {field:"Sender Device", value:'', regExField:/^Sender\sDevice/gi, regExValue:/\w+/}, 
                               Sender: {field:"Sender", value:'', regExField:/^Sender\s/gi, regExValue:/([0-9]{9,13})/}, 
                               Type: {field:"Type", value:'', regExField:/^Type\s/gi, regExValue:/\w+/}, 
                               Recipients: {field:"Recipients", value:'', regExField:/^Recipients\s/gi, regExValue:/([0-9]{9,13})/}, 
                               MessageStyle: {field:"Message Style", value:'', regExField:/^Message\sStyle/gi, regExValue:/\w+/}, 
                               MessageSize: {field:"Message Size", value:'', regExField: /^Message\sSize/gi, regExValue:/\d+/}
                            }
        let lastLine;
        let lastElement;
        this.csvData = (getCSVObjAsText(true, csvFieldMapping)) + '\n';

        // Parsing each line data into structure
        this.lines.forEach ((line)=> {
            if (lastLine === "Identifier") {
               this.identifier = line;
            }

            if (/^WhatsApp Business Record Page\s\d{1,5}/gi.test(line) || /\d{1,4}\s.\s\d{1,5}/g.test(line)){
                return;
            } 
            let foundElement;
            for (const key in csvFieldMapping) {
                const element = csvFieldMapping[key].field;
                const fieldRegExp = csvFieldMapping[key].regExField;
                const valueRegExp = csvFieldMapping[key].regExValue; 
                if (fieldRegExp.test(line) && valueRegExp.test(line)) {
                    const val = line.split(line.match(fieldRegExp)).pop();
                    csvFieldMapping[key].value = val;
                    if (element === csvFieldMapping.MessageSize.field){
                        csvFieldMapping.Identifier.value = this.identifier;
                        this.csvData += (getCSVObjAsText(false, csvFieldMapping)) + '\n';
                    }
                    if (element === csvFieldMapping.Recipients.field) {
                        csvFieldMapping[key].value = val.replace(/,/g, '') 
                    }
                    lastElement = element;
                    // console.log(lastElement);
                    foundElement = true;
                    break;
                }
            }

            if ((!foundElement) && (/^(([0-9]{9,14})(,|))/gi.test(line)) && (lastElement === csvFieldMapping.Recipients.field)) {
                csvFieldMapping.Recipients.value += ' ' + line.replace(/,/g, '') 
            }
            lastLine = line;
            
        })
         
    }
}

// File import Viewer
var UIController = (function () { 
    var DOMString = {
        inputFiles: '.input_files',
        downloadList: '.likes__list'
    }
    return {
        getDOMString: () => {
            return DOMString;
        }
    }
}
)();

// File import Module

var controller = (function  (impFileCtrl, UICtrl) {
    var changedFileList = async (event) => {
        state.files = [];//event.target.files;
        Array.prototype.forEach.call(event.target.files, async (file) => {
            const csvFile = new CSVFile(file)
            await csvFile.processFile();
            csvFile.parseDataIntoCSV();
            csvFile.saveIntoCsv();
        });        
    } 

    var setupEventListener =  () => {
        var DOM = UICtrl.getDOMString();
        document.querySelector(DOM.inputFiles).addEventListener('change', changedFileList);
    }
    return {
        init: function () {
            console.log('Application has started');
            setupEventListener();
        }
    }
})(fileImportController, UIController)

controller.init();
