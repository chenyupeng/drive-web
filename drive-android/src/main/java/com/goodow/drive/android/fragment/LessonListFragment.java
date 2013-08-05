package com.goodow.drive.android.fragment;

import java.io.File;
import android.app.ListFragment;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;
import com.goodow.android.drive.R;
import com.goodow.drive.android.Interface.IRemoteControl;
import com.goodow.drive.android.Interface.ILocalFragment;
import com.goodow.drive.android.activity.MainActivity;
import com.goodow.drive.android.activity.play.AudioPlayActivity;
import com.goodow.drive.android.activity.play.VideoPlayActivity;
import com.goodow.drive.android.adapter.CollaborativeAdapter;
import com.goodow.drive.android.adapter.CollaborativeAdapter.OnItemClickListener;
import com.goodow.drive.android.global_data_cache.GlobalConstant;
import com.goodow.drive.android.global_data_cache.GlobalDataCacheForMemorySingleton;
import com.goodow.drive.android.toolutils.Tools;
import com.goodow.realtime.BaseModelEvent;
import com.goodow.realtime.CollaborativeList;
import com.goodow.realtime.CollaborativeMap;
import com.goodow.realtime.Document;
import com.goodow.realtime.DocumentLoadedHandler;
import com.goodow.realtime.EventHandler;
import com.goodow.realtime.Model;
import com.goodow.realtime.ModelInitializerHandler;
import com.goodow.realtime.ObjectChangedEvent;
import com.goodow.realtime.Realtime;
import com.goodow.realtime.ValueChangedEvent;
import elemental.json.JsonArray;

public class LessonListFragment extends ListFragment implements ILocalFragment {
	private final String TAG = this.getClass().getSimpleName();

	private IRemoteControl path;
	private JsonArray currentPathList;
	private CollaborativeMap currentFolder;

	private CollaborativeAdapter adapter;

	private Document doc;
	private Model model;
	private CollaborativeMap root;

	private static final String FOLDER_KEY = GlobalConstant.DocumentIdAndDataKey.FOLDERSKEY
			.getValue();
	private static final String FILE_KEY = GlobalConstant.DocumentIdAndDataKey.FILESKEY
			.getValue();

	private EventHandler<ValueChangedEvent> pathChangeEventHandler;

	private EventHandler<?> listEventHandler;

	private EventHandler<ObjectChangedEvent> valuesChangeEventHandler;

	public void backFragment() {
		if (null != currentPathList && 1 < currentPathList.length()) {
			String mapId = path.getMapId(currentPathList.length() - 1);
			CollaborativeMap currentmap = model.getObject(mapId);
			if (null != currentmap) {
				// 删除监听
				currentmap
						.removeObjectChangedListener(valuesChangeEventHandler);
			}

			path.removeLastPath();
		} else {
			if (null != getActivity()) {
				Toast.makeText(getActivity(), R.string.backFolderErro,
						Toast.LENGTH_SHORT).show();
			}
		}
	}

	public void connectUi() {
		Log.i(TAG, "connectUi()");

		if (null != path) {

			path.addListener(pathChangeEventHandler);

			currentPathList = path.getCurrentPath();
			if (0 == currentPathList.length()) {
				path.addPath(root.getId());

			}

			currentFolder = model.getObject(path.getMapId(currentPathList
					.length() - 1));

			initData();
		}
	}

	public void initData() {
		if (null != currentFolder) {
			currentFolder.addObjectChangedListener(valuesChangeEventHandler);
			CollaborativeList folderList = (CollaborativeList) currentFolder
					.get(FOLDER_KEY);
			CollaborativeList fileList = (CollaborativeList) currentFolder
					.get(FILE_KEY);

			adapter.setFolderList(folderList);
			adapter.setFileList(fileList);
			adapter.notifyDataSetChanged();

			// 设置action bar的显示
			MainActivity activity = (MainActivity) getActivity();
			if (null != activity) {
				if (currentPathList.length() <= 1) {
					((MainActivity) getActivity()).restActionBarTitle();

				} else {
					StringBuffer title = new StringBuffer();
					for (int i = 0; i < currentPathList.length(); i++) {
						CollaborativeMap currentMap = model.getObject(path
								.getMapId(i));

						String label = currentMap.get("label");
						if (null != label) {
							title.append("/" + label);
						}
					}

					((MainActivity) getActivity()).setActionBarTitle(title
							.toString());
				}
			}
		}
	}

	@Override
	public void onPause() {
		super.onPause();

		((MainActivity) getActivity()).restActionBarTitle();
	}

	@Override
	public void onResume() {
		super.onResume();

		if (null == path) {
			path = ((MainActivity) getActivity()).getRemoteControlObserver();

			if (null != root) {
				connectUi();
			}
		}
	}

	@Override
	public void onActivityCreated(Bundle savedInstanceState) {
		super.onActivityCreated(savedInstanceState);

		MainActivity activity = (MainActivity) getActivity();

		activity.setIRemoteFrament(this);
		activity.setLastiRemoteDataFragment(this);

		TextView textView = (TextView) ((MainActivity) getActivity())
				.findViewById(R.id.openfailure_text);
		ImageView imageView = (ImageView) ((MainActivity) getActivity())
				.findViewById(R.id.openfailure_img);
		activity.setOpenStateView(textView, imageView);

	}

	private void initEventHandler() {
		if (listEventHandler == null) {
			listEventHandler = new EventHandler<BaseModelEvent>() {
				@Override
				public void handleEvent(BaseModelEvent event) {
					adapter.notifyDataSetChanged();

					openState();
				}
			};
		}

		if (pathChangeEventHandler == null) {
			pathChangeEventHandler = new EventHandler<ValueChangedEvent>() {
				@Override
				public void handleEvent(ValueChangedEvent event) {
					currentPathList = path.getCurrentPath();

					if (null != currentPathList
							&& 0 != currentPathList.length()) {
						CollaborativeMap map = model.getObject(path
								.getMapId(currentPathList.length() - 1));
						if (null != map) {
							// 判断若为文件,则触发播放功能,并且pathList自动-1(即执行一遍backfragment()方法)
							if (null == map.get(FOLDER_KEY)) {
								File file = new File(
										GlobalDataCacheForMemorySingleton.getInstance
												.getOfflineResDirPath()
												+ "/"
												+ map.get("blobKey"));

								if (file.exists()) {
									Intent intent = null;

									String resPath = GlobalDataCacheForMemorySingleton.getInstance
											.getOfflineResDirPath() + "/";

									if (GlobalConstant.SupportResTypeEnum.MP3
											.getTypeName()
											.equals(Tools
													.getTypeByMimeType((String) map
															.get("type")))) {
										intent = new Intent(getActivity(),
												AudioPlayActivity.class);

										intent.putExtra(
												AudioPlayActivity.IntentExtraTagEnum.MP3_NAME
														.name(), (String) map
														.get("label"));
										intent.putExtra(
												AudioPlayActivity.IntentExtraTagEnum.MP3_PATH
														.name(),
												resPath
														+ (String) map
																.get("blobKey"));
									} else if (GlobalConstant.SupportResTypeEnum.MP4
											.getTypeName()
											.equals(Tools
													.getTypeByMimeType((String) map
															.get("type")))) {
										intent = new Intent(getActivity(),
												VideoPlayActivity.class);

										intent.putExtra(
												VideoPlayActivity.IntentExtraTagEnum.MP4_NAME
														.name(), (String) map
														.get("label"));
										intent.putExtra(
												VideoPlayActivity.IntentExtraTagEnum.MP4_PATH
														.name(),
												resPath
														+ (String) map
																.get("blobKey"));
									} else if (GlobalConstant.SupportResTypeEnum.FLASH
											.getTypeName()
											.equals(Tools
													.getTypeByMimeType((String) map
															.get("type")))) {
										// TODO
									} else {
										intent = new Intent();

										intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
										intent.setAction(Intent.ACTION_VIEW);
										String type = map.get("type");
										intent.setDataAndType(
												Uri.fromFile(file), type);
									}

									getActivity().startActivity(intent);
								} else {
									Toast.makeText(getActivity(), "请先下载该文件.",
											Toast.LENGTH_SHORT).show();
								}

								backFragment();
							} else {
								// 判断若为文件夹,则展现数据
								currentFolder = model
										.getObject(path
												.getMapId(currentPathList
														.length() - 1));

								initData();

								openState();
							}
						} else {
							backFragment();
						}
					}
				}
			};
		}

		if (valuesChangeEventHandler == null) {
			valuesChangeEventHandler = new EventHandler<ObjectChangedEvent>() {
				@Override
				public void handleEvent(ObjectChangedEvent event) {
					adapter.notifyDataSetChanged();
				}
			};
		}
	}

	private void openState() {
		if (null != currentFolder) {
			CollaborativeList folderList = currentFolder.get(FOLDER_KEY);
			CollaborativeList fileList = currentFolder.get(FILE_KEY);

			MainActivity activity = (MainActivity) getActivity();
			if (null != activity) {
				if (null != folderList && 0 == folderList.length()
						&& null != fileList && 0 == fileList.length()) {
					activity.openState(LinearLayout.VISIBLE);
				} else {
					activity.openState(LinearLayout.INVISIBLE);
				}
			}
		}

	}

	@Override
	public void onCreate(Bundle savedInstanceState) {
		Log.i(TAG, "onCreate()");

		super.onCreate(savedInstanceState);
		adapter = new CollaborativeAdapter(this.getActivity(), null, null,
				new OnItemClickListener() {
					@Override
					public void onItemClick(CollaborativeMap file) {
						MainActivity activity = (MainActivity) LessonListFragment.this
								.getActivity();

						DataDetailFragment dataDetailFragment = activity
								.getDataDetailFragment();
						dataDetailFragment.setFile(file);
						dataDetailFragment.initView();

						activity.setDataDetailLayoutState(View.VISIBLE);
						activity.setIRemoteFrament(dataDetailFragment);

					}
				});
		setListAdapter(adapter);

		initEventHandler();

		// 文件Document
		DocumentLoadedHandler onLoaded = new DocumentLoadedHandler() {
			@Override
			public void onLoaded(Document document) {
				Log.i(TAG, "onLoaded()");

				doc = document;
				model = doc.getModel();
				root = model.getRoot();

				connectUi();
			}
		};

		ModelInitializerHandler initializer = new ModelInitializerHandler() {
			@Override
			public void onInitializer(Model model_) {
				model = model_;
				root = model.getRoot();

				String[] mapKey = { "label", FILE_KEY, FOLDER_KEY };
				CollaborativeMap[] values = new CollaborativeMap[3];

				for (int k = 0; k < values.length; k++) {
					CollaborativeMap map = model.createMap(null);
					for (int i = 0; i < mapKey.length; i++) {
						if ("label".equals(mapKey[i])) {
							map.set(mapKey[i], "Lesson" + k);
						} else {
							CollaborativeList subList = model.createList();

							if (FOLDER_KEY.equals(mapKey[i])) {
								CollaborativeMap subMap = model.createMap(null);
								subMap.set("label", "SubFolder");
								subMap.set(FILE_KEY, model.createList());
								subMap.set(FOLDER_KEY, model.createList());
								subList.push(subMap);
							}

							map.set(mapKey[i], subList);
						}
					}

					values[k] = map;
				}

				CollaborativeList list = model_.createList();
				list.pushAll((Object[]) values);

				root.set(GlobalConstant.DocumentIdAndDataKey.FOLDERSKEY
						.getValue(), list);

			}
		};

		String docId = "@tmp/"
				+ GlobalDataCacheForMemorySingleton.getInstance().getUserId()
				+ "/"
				+ GlobalConstant.DocumentIdAndDataKey.LESSONDOCID.getValue();

		Realtime.load(docId, onLoaded, initializer, null);

	}

	@Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container,
			Bundle savedInstanceState) {
		return inflater.inflate(R.layout.fragment_folderlist, container, false);
	}

	@Override
	public void onListItemClick(ListView l, View v, int position, long id) {
		CollaborativeMap clickItem = (CollaborativeMap) v.getTag();

		path.addPath(clickItem.getId());
	}
}
