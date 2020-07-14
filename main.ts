/**
 * KSR030_Spider V0.010
 */
//% weight=10 color=#00A6F0 icon="\uf085" block="KSR030_Spider"
namespace KSR030_Spider {

    const SERVOMIN = 104 // this is the 'minimum' pulse length count (out of 4096)
    const SERVOMAX = 510 // this is the 'maximum' pulse length count (out of 4096)
    const IIC_ADDRESS = 0x40
    const LED0_ON_L = 0x06
    let initialized = false;



    export enum SpiderServoNum {

        //% blockId="L_Upper_Arm" block="L_Upper_Arm"
        L_Upper_Arm = 11,
        //% blockId="L_Forearm" block="L_Forearm"
        L_Forearm = 7,
        //% blockId="R_Upper_Arm" block="R_Upper_Arm"
        R_Upper_Arm = 10,
        //% blockId="R_Forearm" block="R_Forearm"
        R_Forearm = 6,
        //% blockId="L_Upper_Thigh" block="L_Upper_Thigh"
        L_Upper_Thigh = 8,
        //% blockId="L_Lower_Thigh" block="L_Lower_Thigh"
        L_Lower_Thigh = 4,
        //% blockId="R_Upper_Thigh" block="R_Upper_Thigh"
        R_Upper_Thigh = 9,
        //% blockId="R_Lower_Thigh" block="R_Lower_Thigh"
        R_Lower_Thigh = 5,

    }

    export enum SpiderState {
        //% blockId="Wagging_tail" block="calibration"
        calibration = 1,
        //% blockId="Forward" block="forward"
        forward = 2,
        //% blockId="Backward" block="backward"
        backward = 3,
        //% blockId="Go_Left" block="Leftward"
        Leftward = 4,
        //% blockId="GO_Right" block="Rightward"
        Rightward = 5,
        //% blockId="Backward" block="stand_up"
        stand_up = 6,
        //% blockId="Rightward" block="get_down"
        get_down = 7


    }


    function servo_map(x: number, in_min: number, in_max: number, out_min: number, out_max: number) {
        return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;

        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);
    }

    /**
     * Used to move the given servo to the specified degrees (0-180) connected to the KSR030
     * @param channel The number (1-16) of the servo to move
     * @param degrees The degrees (0-180) to move the servo to 
     */
    //% blockId=KSR030_SpiderServo
    //% block="Servo channel %channel|degrees %degree"
    //% weight=86
    //% degree.min=0 degree.max=180
    export function SpiderServo(channel: SpiderServoNum, degree: number): void {

        // 50hz: 20,000 us
        //let servo_timing = (degree*1800/180+600) // 0.55 ~ 2.4
        //let pulselen = servo_timing*4096/20000
        //normal 0.5ms~2.4ms
        //SG90 0.5ms~2.0ms
        if (!initialized) {
            KSR030.Servo(KSR030.ServoNum.S0, 90)
            initialized = true;
        }

        let pulselen = servo_map(degree, 0, 180, SERVOMIN, SERVOMAX);
        //let pulselen = servo_map(degree, 0, 180, servomin, servomax);
        setPwm(channel, 0, pulselen);

    }
    //% blockId=KSR030_Spider_Action
    //% block="Action %index|Speed %speed"
    //% weight=87
    //% speed.min=0 speed.max=255
    export function Spider_Action(index: SpiderState, speed: number): void {
        if (speed == 0) {
            speed = 50;

        }

        switch (index) {
            case SpiderState.calibration:
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Arm, 90)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Arm, 90)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Thigh, 90)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Thigh, 90)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Forearm, 90)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Forearm, 90)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Lower_Thigh, 90)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Lower_Thigh, 90)
                basic.pause(speed)
                break;
            case SpiderState.stand_up:
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Arm, 90)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Arm, 90)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Thigh, 90)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Thigh, 90)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Forearm, 70)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Forearm, 110)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Lower_Thigh, 110)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Lower_Thigh, 70)
                basic.pause(speed)
                break;
            case SpiderState.get_down:
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Arm, 90)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Arm, 90)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Thigh, 90)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Thigh, 90)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Forearm, 50)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Forearm, 130)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Lower_Thigh, 130)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Lower_Thigh, 50)
                basic.pause(speed)
                break;
            case SpiderState.forward:

                SpiderServo(KSR030_Spider.SpiderServoNum.L_Forearm, 50)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Arm, 45)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Forearm, 70)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Arm, 90)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Thigh, 135)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Thigh, 45)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Lower_Thigh, 50)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Thigh, 90)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Lower_Thigh, 70)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Forearm, 130)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Arm, 135)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Forearm, 110)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Arm, 90)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Thigh, 135)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Thigh, 45)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Lower_Thigh, 130)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Thigh, 90)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Lower_Thigh, 110)
                basic.pause(speed)

                break;
            case SpiderState.backward:

                SpiderServo(KSR030_Spider.SpiderServoNum.R_Lower_Thigh, 50)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Thigh, 45)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Lower_Thigh, 70)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Thigh, 90)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Arm, 135)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Arm, 45)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Forearm, 50)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Arm, 90)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Forearm, 70)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Lower_Thigh, 130)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Thigh, 135)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Lower_Thigh, 110)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Thigh, 90)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Arm, 135)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Arm, 45)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Forearm, 130)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Arm, 90)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Forearm, 110)
                basic.pause(speed)

                break;
            case SpiderState.Rightward:
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Forearm, 50)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Arm, 45)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Forearm, 70)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Arm, 135)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Thigh, 75)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Thigh, 105)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Forearm, 130)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Arm, 90)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Forearm, 110)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Thigh, 90)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Thigh, 120)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Arm, 60)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Lower_Thigh, 50)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Thigh, 45)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Lower_Thigh, 70)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Thigh, 135)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Arm, 75)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Arm, 105)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Lower_Thigh, 130)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Thigh, 90)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Lower_Thigh, 110)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Arm, 90)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Arm, 120)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Thigh, 60)
                basic.pause(speed)
                break;
            case SpiderState.Leftward:
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Forearm, 130)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Arm, 135)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Forearm, 110)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Arm, 45)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Thigh, 105)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Thigh, 75)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Forearm, 50)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Arm, 90)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Forearm, 70)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Thigh, 90)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Thigh, 60)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Arm, 120)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Lower_Thigh, 130)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Thigh, 135)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Lower_Thigh, 110)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Thigh, 45)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Arm, 105)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Arm, 75)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Lower_Thigh, 50)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Thigh, 90)
                basic.pause(speed)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Lower_Thigh, 70)
                SpiderServo(KSR030_Spider.SpiderServoNum.R_Upper_Arm, 90)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Arm, 60)
                SpiderServo(KSR030_Spider.SpiderServoNum.L_Upper_Thigh, 120)
                basic.pause(speed)
                break;



        }
    }



}
