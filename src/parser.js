SEPERATOR = ','

class Configuration
{
    constructor(configFile)
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
        this.Read (configFile);
    }
    
    Read (configFile)
    {
        let lineIndex = 0;
        let line;
        const data = configFile;
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
    constructor(time)
    {
        this.time = time;
    }

    static fromLine(line)
    {
        const parts = line.split(SEPERATOR);
        const [day, month, year] = parts[0].split('/').map(Number);
        const [hour, minutes, seconds] = parts[1].split(':').map(Number);
        const time = new Date(year, month, day, hour, minutes, seconds)
        return new TimeStamp(time);
    }

    static fromBuffer(buffer, config) {
        const timestampValue = buffer.readUInt32LE(0);
        
        if (timestampValue === 0xFFFFFFFF) {
            return new TimeStamp(null);
        }

        const timemult = config.ts_mul_fac;
        const ms = timestampValue * timemult / 1000 + config.start_timestamp.time.getTime();
        const time = new Date(ms); 

        return new TimeStamp(time);
    }
}

class Sample
{
   constructor(buffer, config)
   {
        this.sample_number = null;
        this.timestamp = null;
        this.analog_data = [];
        this.status_data = [];
        this.config = config;

        this.Read(buffer, config);
   }

   Read(buffer)
   {
        // Sample number (4 bytes, little-endian)
        this.sample_number = buffer.readUInt32LE(0);

        // Timestamp (4 bytes, little-endian)
        this.timestamp = TimeStamp.fromBuffer(buffer.subarray(4, 8), this.config);

        // Analog channel sample data (2 bytes each)
        let p = 0;
        for (let i = 8; i < 8 + this.config.analog_count * 2; i += 2) {
            let data = this.config.analog_channels[p].a * buffer.readInt16LE(i) + this.config.analog_channels[p].b;
            this.analog_data.push(data);
            p++;
        }

        // Status channel sample data
        p = 0;
        for (let i = 8 + this.config.analog_count * 2; i < buffer.length; i += 2) {
            // Read 2 bytes they represent 16 different status channels. Push them 1 or 0 to the status_data array
            const statusByte = buffer.readUInt16LE(i);
            for (let j = 0; p*16 + j < this.config.status_count; j++) {
                this.status_data.push((statusByte >> j) & 1);
            }
            p+=1;
        }
   }
   
    getAnalogValue(n)
    {
        // n starts from 1
        const result = {
            timestamp: this.timestamp,
            value: this.analog_data[n - 1]
        }
        return result;
    }

    getStatusValue(n)
    {
        // n starts from 1
        const result = {
            timestamp: this.timestamp,
            value: this.status_data[n - 1]
        }
        return result;
    }
}

class Data
{
    constructor(config, dataFile)
    {
        this.config = config;
        this.sample_size = 4 + 4 + config.analog_count * 2 + 2 * Math.ceil(config.status_count / 16);
        this.samples = [];

        this.Read(dataFile);
    }
    
    Read(dataFile)
    {
        const data = dataFile;
        const buffer = Buffer.from(data);
        
        for (let offset = 0; offset < buffer.length; offset += this.sample_size) 
        {
            const sampleBuffer = buffer.subarray(offset, offset + this.sample_size);
            const newSample = new Sample(sampleBuffer, this.config);
            this.samples.push(newSample);
        }
    }

    getPrettyData()
    {
        let analogChannelsData = [];
        let statusChannelsData = [];
        this.config.analog_channels.forEach(analogChannel => {
            let channelData = {
                name: analogChannel.ch_id,
                data: []
            };
            this.samples.forEach(sample => {
                channelData.data.push(sample.getAnalogValue(analogChannel.n));
            });
            analogChannelsData.push(channelData);
        });

        this.config.status_channels.forEach(statusChannel => {
            let channelData = {
                name: statusChannel.ch_id,
                data: []
            };
            this.samples.forEach(sample => {
                channelData.data.push(sample.getStatusValue(statusChannel.n));
            });
            statusChannelsData.push(channelData);
        });
        return {
            analogChannels: analogChannelsData,
            statusChannels: statusChannelsData
        }
    }
}

class ComtradeParser
{
    constructor(configFile, dataFile)
    {
        this.config = new Configuration(configFile);
        this.data = new Data(this.config, dataFile);
    }
    getPrettyData()
    {
        return this.data.getPrettyData();
    }
}

module.exports = {ComtradeParser, TimeStamp};