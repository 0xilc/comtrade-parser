const fs = require('fs');
// COMMON
SEPERATOR = ','

// Stands for reading cfg file and storing the configuration data
class Configuration
{
    constructor(filepath)
    {
        // Fields
        this.station_name       = null;
        this.rec_dev_id         = null;
        this.rev_year           = null;

        this.channels_count     = null;
        this.analog_count       = null;
        this.status_count       = null;

        this.analog_channels    = null;  // Array of analog channels
        this.status_channels    = null;  // Array of status channels

        this.line_frequency     = null;

        this.nrates             = null;
        this.samp               = null;
        this.endsamp            = null;

        this.start_timestamp    = null;
        this.trigger_timestamp  = null;

        this.file_type          = null;
        this.ts_mul_fac         = null;
        
        // Read the file to initialize the fields
        this.Read (filepath);
    }
    
    Read (filepath)
    {
        let lineIndex = 0;
        let line;
        const data = fs.readFileSync(filepath, 'utf8');
        const lines = data.split('\r\n');

        // First line
        line = lines[lineIndex++];
        const firstLineParts = line.split(SEPERATOR);
        this.station_name       = firstLineParts[0];
        this.rec_dev_id         = firstLineParts[1];
        this.rev_year           = firstLineParts[2];
        
        // Channel counts
        line = lines[lineIndex++];
        const secondLineParts = line.split(SEPERATOR);
        this.channels_count     = secondLineParts[0];
        this.analog_count       = secondLineParts[1].split('A')[0];
        this.status_count       = secondLineParts[2].split('D')[0];

        // Analog channels
        this.analog_channels = [];
        for (let i = 0; i < this.analog_count; i++)
        {
            line = lines[lineIndex++];
            const analogChannel = new AnalogChannel(line);
            this.analog_channels.push(analogChannel);
        }

        // Status channels
        this.status_channels = [];
        for (let i = 0; i < this.status_count; i++)
        {
            line = lines[lineIndex++];
            const statusChannel = new StatusChannel(line);
            this.status_channels.push(statusChannel);
        }

        // Line frequency
        line = lines[lineIndex++];
        const thirdLineParts = line.split(SEPERATOR);
        this.line_frequency     = thirdLineParts[0];

        // Nrate
        line = lines[lineIndex++];
        const fourthLineParts = line.split(SEPERATOR);
        this.nrates             = fourthLineParts[0];
       
        // Samp
        line = lines[lineIndex++];
        const fifthLineParts = line.split(SEPERATOR);
        this.samp               = fifthLineParts[0];
        this.endsamp            = fifthLineParts[1];

        // Timestamps
        line = lines[lineIndex++];
        this.start_timestamp    = TimeStamp.fromLine(line);
        line = lines[lineIndex++];
        this.trigger_timestamp  = TimeStamp.fromLine(line);

        // File type
        line = lines[lineIndex++];
        const seventhLineParts = line.split(SEPERATOR);
        this.file_type          = seventhLineParts[0];

        // Time stamp multiplier factor
        line = lines[lineIndex++];
        const eighthLineParts = line.split(SEPERATOR);
        this.ts_mul_fac         = eighthLineParts[0];

        // Sanity check
        this.SanityCheck();
    }

    // Check if the configuration is valid by checking critical fields are not null
    SanityCheck()
    {
        if (
            this.rev_year == '' ||
            this.channels_count == '' ||
            this.analog_count == '' ||
            this.status_count == '' ||
            this.nrates == '' ||
            this.samp == '' ||
            this.endsamp == '' ||
            this.file_type == '' ||
            this.ts_mul_fac == ''
        ) {
            throw new Error("Error : Error on reading the configuration file.");
        } 
        else
        {
            return;
        }
    }
}

class AnalogChannel
{
    constructor(line)
    {
        this.n         = null;
        this.ch_id      = null;
        this.ph         = null;
        this.ccbm       = null;
        this.uu         = null;
        this.a          = null;
        this.b          = null;
        this.skew       = null;
        this.min        = null;
        this.max        = null;
        this.primary    = null;
        this.secondary  = null;
        this.ps         = null;

        this.Read(line);
    }
    
    Read(line)
    {
        const parts = line.split(SEPERATOR);
        this.n = parts[0];
        this.ch_id = parts[1];
        this.ph = parts[2];
        this.ccbm = parts[3];
        this.uu = parts[4];
        this.a = parts[5];
        this.b = parts[6];
        this.skew = parts[7];
        this.min = parts[8];
        this.max = parts[9];
        this.primary = parts[10];
        this.secondary = parts[11];
        this.ps = parts[12];
        this.SanityCheck();
    }

    SanityCheck()
    {
        if(
            this.an         == '' ||
            this.uu         == '' ||
            this.a          == '' ||
            this.b          == '' ||
            this.min        == '' ||
            this.max        == '' ||
            this.primary    == '' ||
            this.secondary  == '' ||
            this.ps         == ''
        )
        {
            throw new Error(": AnalogChannel : Sanity error.");
        }
        else
        {
            return;
        }
    }
}

class StatusChannel
{
    constructor(line)
    {
        this.n         = null;
        this.ch_id      = null;
        this.ph         = null;
        this.ccbm       = null;
        this.y         = null;
        
        this.Read(line);
        
    }
    
    // TODO : Read the line and initialize the fields
    Read(line)
    {
        const parts = line.split(SEPERATOR);
        this.n = parts[0];
        this.ch_id = parts[1];
        this.ph = parts[2];
        this.ccbm = parts[3];
        this.y = parts[4];
        this.SanityCheck();
    }
    
    SanityCheck()
    {
        if(
            this.n         == '' ||
            this.y         == ''
        )
        {
            throw new Error(": StatusChannel : Sanity error.");
        }
        else
        {
            return;
        }
    }
}

class TimeStamp
{
    constructor(day, month, year, hour, minutes, seconds)
    {
        this.day                = day;
        this.month              = month;
        this.year               = year;
        this.hour               = hour;
        this.minutes            = minutes;
        this.seconds            = seconds;
    }

    static fromLine(line)
    {
        const parts = line.split(SEPERATOR);
        const [day, month, year] = parts[0].split('/').map(Number);
        const [hour, minutes, seconds] = parts[1].split(':').map(Number);
        return new TimeStamp(day, month, year, hour, minutes, seconds);
    }

    static fromBuffer(buffer, config) {
        const timestampValue = buffer.readUInt32LE(0);
        
        if (timestampValue === 0xFFFFFFFF) {
            return new TimeStamp(null, null, null, null, null, null);
        }

        const timemult = config.ts_mul_fac;
        const timestampMilliseconds = timestampValue * timemult;

        const date = new Date(timestampMilliseconds / 1000); // Convert to seconds
        const day = date.getUTCDate();
        const month = date.getUTCMonth() + 1; // Months are 0-based
        const year = date.getUTCFullYear();
        const hour = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        const seconds = date.getUTCSeconds();

        return new TimeStamp(day, month, year, hour, minutes, seconds);
    }
}

class Sample
{
    // Layout
    /*
        4byte           4byte       // 2byte                
        sample_number   timestamp   Analog channel sample
                                    (hex 8000 reserved for 
                                     missing data) 

        SAMPLE SIZE = 4 + 4 + A*2 + 2* INT(S/16) bytes
    */
   constructor(buffer, config)
   {
        this.sample_number = null;
        this.timestamp = null;
        this.analog_samples = [];
        this.status_samples = [];
        
        this.Read(buffer, config);
   }

   Read(buffer, config)
   {
        // Sample number (4 bytes, little-endian)
        this.sample_number = buffer.readUInt32LE(0);

        // Timestamp (4 bytes, little-endian)
        this.timestamp = TimeStamp.fromBuffer(buffer.subarray(4, 8), config);

        // Analog channel sample data (2 bytes each)
        for (let i = 8; i < 8 + config.analog_count * 2; i += 2) {
            this.analog_samples.push(buffer.readInt16LE(i));
        }

        // Status channel sample data (2 bytes each, grouped by 16 channels)
        for (let i = 8 + config.analog_count * 2; i < buffer.length; i += 2) {
            this.status_samples.push(buffer.readUInt16LE(i));
        }
   }
}

// TODO : Optimize parameter passing
class Data
{
    constructor(config, filepath)
    {
        this.config = config;
        this.sample_size = 4 + 4 + config.analog_count * 2 + 2 * Math.ceil(config.status_count / 16);
        this.samples = [];

        this.Read(filepath);
    }
    
    Read(filepath)
    {
        const data = fs.readFileSync(filepath);
        const buffer = Buffer.from(data);
        
        for (let offset = 0; offset < buffer.length; offset += this.sample_size) 
        {
            const sampleBuffer = buffer.subarray(offset, offset + this.sample_size);
            const newSample = new Sample(sampleBuffer, this.config);
            this.samples.push(newSample);
        }
    }
}


module.exports = { StatusChannel, AnalogChannel, Configuration, Data };