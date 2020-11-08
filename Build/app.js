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
                               Identifier: {field:"Identifier", value:''},
                               Timestamp: {field:"Timestamp", value:''}, 
                               MessageId: {field:"Message Id", value:''}, 
                               Sender: {field:"Sender", value:''}, 
                               Recipients: {field:"Recipients", value:''}, 
                               SenderIp: {field:"Sender Ip", value:''}, 
                               SenderPort: {field:"Sender Port", value:''}, 
                               SenderDevice: {field:"Sender Device", value:''}, 
                               Type: {field:"Type", value:''}, 
                               MessageStyle: {field:"Message Style", value:''}, 
                               MessageSize: {field:"Message Size", value:''}
                            }
        let lastLine;
        this.csvData = (getCSVObjAsText(true, csvFieldMapping)) + '\n';

        // Parsing each line data into structure
        this.lines.forEach ((line)=> {
            if (lastLine === "Identifier") {
               this.identifier = line;
            }
            
            for (const key in csvFieldMapping) {
                const element = csvFieldMapping[key].field + ' ';
                if (line.includes(element)) {
                    if (line.includes(element)){
                        const val = line.split(element).pop();
                        csvFieldMapping[key].value = val;
                    }
                    if (element === csvFieldMapping.MessageSize.field + ' '){
                        csvFieldMapping.Identifier.value = this.identifier;
                        this.csvData += (getCSVObjAsText(false, csvFieldMapping)) + '\n';
                    }
                }

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
