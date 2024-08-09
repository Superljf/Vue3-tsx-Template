import { defineComponent, ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { downloadArticle, getArticleList, uploadArticle } from '@/api/types/comomn';
import { ConfigProvider, message, Pagination, Progress, Spin, Table, Upload } from 'ant-design-vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { useRouter } from 'vue-router';
import styles from './index.module.less';

export default defineComponent({
	name: 'HomePage',
	setup() {
		const loading = ref(false);
		const articleList = ref([]);
		const total = ref(0);
		const page = ref(1);
		const pageSize = ref(10);
		const isOpen = ref(false);
		const countdown = ref(3);
		const percent = ref(0);
		const tableHeight = ref(0);
		const downOpen = ref(false);
		const downId = ref('');

		const router = useRouter();

		const handleResize = () => {
			tableHeight.value = window.innerHeight - 320;
		};

		onMounted(() => {
			sessionStorage.setItem('rightScrollPosition', '0');
			handleResize();
			window.addEventListener('resize', handleResize);

			handleGetArticleList(page.value, pageSize.value, true);
			const intervalId = setInterval(() => {
				handleGetArticleList(page.value, pageSize.value, false);
			}, 10000);

			onBeforeUnmount(() => {
				clearInterval(intervalId);
				window.removeEventListener('resize', handleResize);
			});
		});

		watch([isOpen, countdown], () => {
			if (isOpen.value && countdown.value > 1) {
				setTimeout(() => {
					countdown.value -= 1;
				}, 1000);
			} else if (countdown.value === 1) {
				isOpen.value = false;
				handleChange(downId.value);
			}
		});

		const handleGetArticleList = async (page: number, pageSize: number, isLoading = true) => {
			try {
				loading.value = isLoading;
				const res = await getArticleList(page, pageSize);
				articleList.value = res?.list || [];
				total.value = res?.totalNum || 0;
			} catch (error) {
				console.error(error);
			} finally {
				loading.value = false;
			}
		};

		const downArticle = async (type = 0) => {
			try {
				downOpen.value = false;
				loading.value = true;
				await downloadArticle({
					articleId: downId.value,
					type
				});
				message.success('下载成功！');
			} catch (error) {
				message.error('下载失败');
			} finally {
				loading.value = false;
			}
		};

		const handleChange = (id: string) => {
			router.push({
				name: 'essayPolishing',
				query: {
					articleId: id,
					stage: ''
				}
			});
		};

		const handlePolish = (id: string) => {
			router.push({
				name: 'essayPolishing',
				query: {
					articleId: id,
					stage: 'polish'
				}
			});
		};

		const handleCheck = (id: string) => {
			router.push({
				name: 'essayPolishing',
				query: {
					articleId: id,
					stage: 'proofread'
				}
			});
		};

		const handleRead = (id: string) => {
			router.push({
				name: 'essayPolishing',
				query: {
					articleId: id,
					stage: 'finalize'
				}
			});
		};

		const beforeUpload = (file: File) => {
			const allowedFileTypes = ['doc', 'docx'];
			const fileExtension = file.name.split('.').pop();
			const isAllowedFileType = allowedFileTypes.includes(fileExtension!);
			if (!isAllowedFileType) {
				message.error({
					content: '只能上传doc、docx文件!',
					style: {
						marginTop: '20vh'
					},
					duration: 2.5
				});
			}
			return isAllowedFileType;
		};

		const customRequest = async ({ file }: { file: File }) => {
			let uploadPercent = 0;
			const interval = setInterval(() => {
				uploadPercent += 10;
				percent.value = uploadPercent;
				if (uploadPercent >= 90) {
					clearInterval(interval);
				}
			}, 100);
			const formData = new FormData();
			formData.append('file', file);
			try {
				const res = await uploadArticle(formData);
				downId.value = res?.data?.data?.articleId;
				clearInterval(interval);
				percent.value = 100;
				setTimeout(() => {
					percent.value = 0;
				}, 100);
				handleGetArticleList(page.value, pageSize.value);
				isOpen.value = true;
			} catch (error) {
				percent.value = 0;
				message.error('上传失败');
			}
		};

		const columns = [
			{
				title: '文档名称',
				dataIndex: 'articleFullName',
				key: 'articleFullName',
				width: '50%',
				customRender: ({ text, record }: { text: string; record: any }) => {
					const statusMap = {
						'-1': '上传失败',
						'-2': 'AI 润色报错',
						'1': '已上传',
						'2': 'AI润色中',
						'3': 'AI润色成功',
						'4': '校对中',
						'5': '已定稿'
					};
					const colorMap = {
						'1': {
							bgColor: '#FFF2EB',
							color: '#FF7833'
						},
						'-2': {
							bgColor: '#FFEEF3',
							color: '#FF3345'
						},
						'2': {
							bgColor: '#EDE5FA',
							color: '#802DE7'
						},
						'3': {
							bgColor: '#EAF0FD',
							color: '#3168EC'
						},
						'4': {
							bgColor: '#FFEBEB',
							color: '#FF3F33'
						},
						'5': {
							bgColor: '#EDF7F4',
							color: '#21A97A'
						}
					};
					return (
						<div style={{ display: 'flex', alignItems: 'center' }}>
							<div class={styles.name}>{text}</div>
							<div
								class={styles.status_span}
								style={{
									backgroundColor: colorMap[record.status]?.bgColor,
									color: colorMap[record.status]?.color,
									display: 'flex',
									alignItems: 'center'
								}}>
								{record.status === -2 && <img src="./img/icon_err.png" style={{ width: 16, marginRight: 4, marginBottom: 1 }} />}
								{statusMap[record.status] || '未知状态'}
							</div>
						</div>
					);
				}
			},
			{
				title: '上传时间',
				dataIndex: 'createdTime',
				key: 'createdTime',
				width: '25%'
			},
			{
				title: '操作',
				dataIndex: 'status',
				key: 'status',
				width: '15%',
				customRender: ({ record }: { record: any }) => {
					return (
						<>
							{record.status === 1 && (
								<div
									class={styles.opeBtn}
									onClick={() => {
										handleChange(record.articleId);
									}}>
									去AI润色
								</div>
							)}
							{(record.status === 2 || record.status === -2) && (
								<div
									class={styles.opeBtn}
									onClick={() => {
										handleRead(record.articleId);
									}}>
									查看
								</div>
							)}
							{record.status === 3 && (
								<div
									class={styles.opeBtn}
									onClick={() => {
										handlePolish(record.articleId);
									}}>
									去校对
								</div>
							)}
							{record.status === 4 && (
								<div
									class={styles.opeBtn}
									onClick={() => {
										handleCheck(record.articleId);
									}}>
									继续校对
								</div>
							)}
							{record.status === 5 && (
								<div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
									<div
										class={styles.opeBtn}
										onClick={() => {
											handleRead(record.articleId);
										}}>
										查看
									</div>
									<div
										class={styles.opeBtn}
										onClick={() => {
											downId.value = record.articleId;
											downOpen.value = true;
										}}>
										下载
									</div>
								</div>
							)}
						</>
					);
				}
			}
		];

		return () => (
			<div>
				<div class={styles.container}>
					<div class={styles.title}>
						<Upload showUploadList={false} customRequest={customRequest} beforeUpload={beforeUpload} accept=".doc,.docx">
							<div class={styles.upBtn}>上传文档</div>
						</Upload>
						{percent.value > 0 && (
							<Progress
								percent={percent.value}
								strokeColor={{
									'0%': '#108ee9',
									'100%': '#87d068'
								}}
								status="active"
							/>
						)}
					</div>
					<Spin spinning={loading.value}>
						<div class={styles.tableBox}>
							<Table columns={columns} dataSource={articleList.value} pagination={false} rowKey="articleId" scroll={{ y: tableHeight.value }} />
							{total.value > 0 && (
								<Pagination
									class={styles.pagination}
									total={total.value}
									current={page.value}
									pageSize={pageSize.value}
									onChange={current => {
										page.value = current;
										handleGetArticleList(current, pageSize.value);
									}}
								/>
							)}
						</div>
					</Spin>
				</div>
			</div>
		);
	}
});
