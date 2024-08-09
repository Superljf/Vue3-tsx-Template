import qs from 'qs';
import fetch from '@/utils/fetch';

export const validAuth = (params: { username: string; password: string }) => {
	return fetch({
		method: 'post',
		url: '/loginAuth',
		data: params
	});
};

export const downloadArticle = (params: any) => {
	return fetch({
		method: 'post',
		url: '/downloadArticle',
		data: params
	});
};

export const getArticleList = (params: any) => {
	return fetch({
		method: 'get',
		url: '/getArticleList',
		data: params
	});
};

export const uploadArticle = (params: any) => {
	return fetch({
		method: 'post',
		url: '/uploadArticle',
		data: params
	});
};
