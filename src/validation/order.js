import Joi from 'joi';

export default {

  createOrder: {
    body: {
      seller_phone: Joi.string().regex(/^[0-9]{5,15}$/).required(),
      buyer_phone: Joi.string().regex(/^[0-9]{5,15}$/).required(),
      category_id: Joi.number().integer().min(1).max(3).required(),
      order_price: Joi.number().integer().min(10000).max(10000000).allow(''),
      order_fee: Joi.number().integer().min(10000).max(10000000).required(),
      order_description: Joi.string().allow(''),
      from_longitude: Joi.string().regex(/^[0-9.]{10,100}$/).required(),
      from_latitude: Joi.string().regex(/^[0-9.]{10,100}$/).required(),
      to_longitude: Joi.string().regex(/^[0-9.]{10,100}$/).required(),
      to_latitude: Joi.string().regex(/^[0-9.]{10,100}$/).required(),
      from_name: Joi.string().required(),
      to_name: Joi.string().required(),
      distance: Joi.string().required(),
      estimated_time: Joi.string().required()
    }
  },

  receiveOrder: {
    body: {
      order_code: Joi.number().integer().required(),
      seller_phone: Joi.string().regex(/^[0-9]{5,15}$/).required(),
      shipper_phone: Joi.string().regex(/^[0-9]{5,15}$/).required(),
      status_flg: Joi.number().integer().min(1).max(3).required()
    }
  }

};
