import qs from 'qs';
import fetch from '@/utils/fetch';

export const validAuth = params => {
	return fetch({
		method: 'post',
		url: '/loginAuth',
		data: params
	});
};
