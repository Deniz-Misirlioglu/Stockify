<?php 
class final_rest
{



/**
 * @api  /api/v1/setTemp/
 * @apiName setTemp
 * @apiDescription Add remote temperature measurement
 *
 * @apiParam {string} location
 * @apiParam {String} sensor
 * @apiParam {double} value
 *
 * @apiSuccess {Integer} status
 * @apiSuccess {string} message
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":0,
 *              "message": ""
 *     }
 *
 * @apiError Invalid data types
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":1,
 *              "message":"Error Message"
 *     }
 *
 */
	public static function setTemp ($location, $sensor, $value)

	{
		if (!is_numeric($value)) {
			$retData["status"]=1;
			$retData["message"]="'$value' is not numeric";
		}
		else {
			try {
				EXEC_SQL("insert into temperature (location, sensor, value, date) values (?,?,?,CURRENT_TIMESTAMP)",$location, $sensor, $value);
				$retData["status"]=0;
				$retData["message"]="insert of '$value' for location: '$location' and sensor '$sensor' accepted";
			}
			catch  (Exception $e) {
				$retData["status"]=1;
				$retData["message"]=$e->getMessage();
			}
		}

		return json_encode ($retData);
	}


	public static function setStock ($stockTicker, $queryType, $jsonData)

        {

                if (!($queryType == "news" || $queryType == "detail")) {
                        $retData["status"]=1;
                        $retData["message"]="'$queryType' is not details or news";
                }
                else {
                        try {
                                EXEC_SQL("insert into stock (stockTicker, queryType, jsonData, dateTime) values (?,?,?,CURRENT_TIMESTAMP)",$stockTicker, $queryType, $jsonData);
                                $retData["status"]=0;
                                $retData["message"]="StockTicker: '$stockTicker' queryType: '$queryType' jsonData '$jsonData' accepted";
                        }
                        catch  (Exception $e) {
                                $retData["status"]=1;
                                $retData["message"]=$e->getMessage();
                        }
                }

                return json_encode ($retData);
	}

	public static function getStock ($date)

        {
    
		try {
				$retData["result"] = GET_SQL("select * from stock where dateTIme like ? order by dateTime", $date . "%");

				if(!empty($retData["result"])) {
				$retData["status"]=0;
                                $retData["message"]="Stock data Recieved at time '$date'";
				}
				else {
				$retData["status"]=1;
                                $retData["message"]="Stock data NOT Recieved '$date'";
				}
			}
                        catch  (Exception $e) {
                                $retData["status"]=1;
                                $retData["message"]=$e->getMessage();
                        }

                return json_encode ($retData);
        }


}

