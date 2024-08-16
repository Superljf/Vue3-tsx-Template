import { defineComponent, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Button, Input, Form, message } from 'ant-design-vue';
import { isDev } from '@/utils/common';
import styles from './index.module.less';
import logo from '@/assets/imgs/logo.png';
import userPng from '@/assets/imgs/user.png';
import pasPng from '@/assets/imgs/pas.png';
import { validAuth } from '@/api/types/comomn';

export default defineComponent({
	name: 'Login',
	setup() {
		const router = useRouter();
		const loading = ref(false);
		const formRef = ref(null);

		const formData = reactive({
			username: isDev() ? '' : '',
			password: isDev() ? '' : ''
		});

		const rules = {
			username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
			password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
		};

		const onFinish = async () => {
			try {
				await formRef?.value.validate();
				loading.value = true;
				const res = await validAuth({ ...formData });
				if (res?.status === -2) {
					message.error('用户名不存在或密码错误');
					return;
				}
				router.push('/workPlace');
			} catch (error) {
				console.error(error);
			} finally {
				loading.value = false;
			}
		};

		return () => (
			<div class={styles.main}>
				<div>
					<img class={styles.logo} src={logo} alt="Logo" />
				</div>
				<div class={styles.login_div}>
					<div class={styles.login_text}>用户登录</div>
					<a-form ref={formRef} model={formData} rules={rules} onFinish={onFinish}>
						<a-form-item name="username">
							<a-input
								v-model={[formData.username, 'value']}
								prefix={<img src={userPng} style={{ width: 16, marginRight: 4 }} />}
								class={styles.input_css}
								placeholder="请输入用户名"
							/>
						</a-form-item>
						<a-form-item name="password">
							<a-input-password
								v-model={[formData.password, 'value']}
								prefix={<img src={pasPng} style={{ width: 16, marginRight: 4 }} />}
								class={styles.input_css}
								style={{ marginTop: 20 }}
								placeholder="请输入密码"
							/>
						</a-form-item>
						<a-form-item>
							<a-button loading={loading.value} type="primary" html-type="submit" class={styles.login}>
								登录
							</a-button>
						</a-form-item>
					</a-form>
				</div>
			</div>
		);
	}
});
