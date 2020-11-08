export default class CSVFile {
    constructor (fileName) {
        this.fileName = fileName;
        this.outputFileName = this.fileName + '__Out.csv';
    }
    
    processLines() {

    }
    readFileAsync(file) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();

            reader.onload = () => {
            resolve(reader.result);
            };

            reader.onerror = reject;

            reader.readAsArrayBuffer(file);
        })
    }
    async processFile () {
        // read file
        try {
            let contentBuffer = await readFileAsync(this.fileName);
            this.lines = contentBuffer.split(/\r\n|\n/);
          } catch(err) {
            console.log(err);
          }
    }
    parseDataIntoCSV() {
        this.lines.forEach ((line)=> {
            console.log(line);
        }) 
    }
}